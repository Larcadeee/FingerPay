import express from "express";
import cors from "cors";
import { usb, findByIds } from "usb";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("./"));

// Supabase client
const supabaseUrl = "https://yzwkdfrbotpcvtnnncns.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6d2tkZnJib3RwY3Z0bm5uY25zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwMDAxMjcsImV4cCI6MjA2MTU3NjEyN30.d1sADufPth97GQeYOSfjkn2340XIYhPb5_oyz50Ppbg";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ADST Fingerprint scanner constants
const VENDOR_ID = 0x2009;
const PRODUCT_ID = 0x7638;

let fingerprintDevice = null;

// Initialize fingerprint scanner
function initializeScanner() {
  try {
    fingerprintDevice = findByIds(VENDOR_ID, PRODUCT_ID);
    if (!fingerprintDevice) {
      console.error("Fingerprint scanner not found");
      return false;
    }

    console.log("Found fingerprint scanner:");
    console.log(
      "- Manufacturer:",
      fingerprintDevice.deviceDescriptor.iManufacturer
    );
    console.log("- Product:", fingerprintDevice.deviceDescriptor.iProduct);
    console.log("- Serial:", fingerprintDevice.deviceDescriptor.iSerialNumber);

    try {
      fingerprintDevice.open();
    } catch (e) {
      console.log("Device already open, trying to close and reopen...");
      try {
        fingerprintDevice.close();
        fingerprintDevice.open();
      } catch (reopenError) {
        console.error("Error reopening device:", reopenError);
        return false;
      }
    }

    // Configure interfaces
    const usbInterface = fingerprintDevice.interface(0);
    console.log("USB Interface:", usbInterface);

    // Log all available endpoints
    console.log("Available endpoints:");
    usbInterface.endpoints.forEach((endpoint, index) => {
      console.log(`Endpoint ${index}:`, {
        address: endpoint.address,
        direction: endpoint.direction,
        transferType: endpoint.transferType,
        descriptor: endpoint.descriptor,
      });
    });

    // On Unix-like systems, kernel driver needs to be detached
    if (process.platform !== "win32") {
      try {
        if (usbInterface.isKernelDriverActive()) {
          try {
            usbInterface.detachKernelDriver();
          } catch (e) {
            console.log("Kernel driver already detached");
          }
        }
      } catch (e) {
        console.log("Error checking kernel driver:", e);
      }
    }

    try {
      usbInterface.claim();
    } catch (e) {
      console.log(
        "Interface might already be claimed, trying to release and reclaim..."
      );
      try {
        usbInterface.release(true, (err) => {
          if (err) {
            console.error("Error releasing interface:", err);
          }
        });
        usbInterface.claim();
      } catch (reclaimError) {
        console.error("Error reclaiming interface:", reclaimError);
        return false;
      }
    }

    // Store the interface for later use
    fingerprintDevice.activeInterface = usbInterface;

    console.log("Fingerprint scanner initialized successfully");
    return true;
  } catch (error) {
    console.error("Error initializing fingerprint scanner:", error);
    return false;
  }
}

// Function to reset the device
async function resetDevice() {
  if (fingerprintDevice) {
    try {
      await new Promise((resolve, reject) => {
        fingerprintDevice.reset((err) => {
          if (err) {
            console.error("Error resetting device:", err);
            reject(err);
          } else {
            resolve();
          }
        });
      });
      return true;
    } catch (error) {
      console.error("Error during device reset:", error);
      return false;
    }
  }
  return false;
}

// Function to capture fingerprint data
async function captureFingerprintData() {
  return new Promise((resolve, reject) => {
    try {
      const usbInterface = fingerprintDevice.activeInterface;
      if (!usbInterface) {
        reject(new Error("USB interface not initialized"));
        return;
      }

      // Find the first IN and OUT endpoints
      const inEndpoint = usbInterface.endpoints.find(
        (ep) => ep.direction === "in"
      );
      const outEndpoint = usbInterface.endpoints.find(
        (ep) => ep.direction === "out"
      );

      if (!inEndpoint || !outEndpoint) {
        reject(new Error("Could not find required endpoints"));
        return;
      }

      console.log("Starting fingerprint capture sequence...");
      console.log("Using endpoints:");
      console.log("- IN endpoint:", inEndpoint.address.toString(16));
      console.log("- OUT endpoint:", outEndpoint.address.toString(16));

      // Commands for ADST scanner
      const CMD_INIT = Buffer.from([0x00]); // Initialize scanner
      const CMD_START_CAPTURE = Buffer.from([0x01]); // Start capture
      const CMD_READ_DATA = Buffer.from([0x02]); // Read captured data

      // Send initialization command
      console.log("Sending initialization command...");
      outEndpoint.transfer(CMD_INIT, (error) => {
        if (error) {
          console.error("Error sending init command:", error);
          reject(error);
          return;
        }

        console.log("Initialization successful, starting capture...");
        // Wait a bit before starting capture
        setTimeout(() => {
          // Send capture command
          outEndpoint.transfer(CMD_START_CAPTURE, (error) => {
            if (error) {
              console.error("Error sending capture command:", error);
              reject(error);
              return;
            }

            console.log("Capture command sent, waiting for finger...");
            // Wait for finger placement and capture
            setTimeout(() => {
              // Send read data command
              outEndpoint.transfer(CMD_READ_DATA, (error) => {
                if (error) {
                  console.error("Error sending read command:", error);
                  reject(error);
                  return;
                }

                console.log("Reading fingerprint data...");
                // Read fingerprint data with timeout
                const timeout = 10000; // 10 seconds timeout
                inEndpoint.timeout = timeout;

                // We expect the fingerprint data to be larger, so let's read more bytes
                inEndpoint.transfer(1024, (error, data) => {
                  if (error) {
                    console.error("Error reading fingerprint data:", error);
                    reject(error);
                    return;
                  }

                  if (!data || data.length === 0) {
                    reject(new Error("No fingerprint data received"));
                    return;
                  }

                  console.log(
                    "Received raw data length:",
                    data.length,
                    "bytes"
                  );
                  console.log("Raw data preview:", data.slice(0, 32)); // Show first 32 bytes for debugging

                  // Process the fingerprint data - convert to base64
                  const fingerprintData = data.toString("base64");
                  console.log(
                    "Processed fingerprint length:",
                    fingerprintData.length
                  );
                  console.log(
                    "Fingerprint data preview:",
                    fingerprintData.substring(0, 50) + "..."
                  );

                  resolve(fingerprintData);
                });
              });
            }, 1000); // Wait 1 second for finger placement
          });
        }, 500); // Wait 500ms after initialization
      });
    } catch (error) {
      console.error("Error in captureFingerprintData:", error);
      reject(error);
    }
  });
}

// Endpoint to start fingerprint capture
app.post("/api/fingerprint/capture", async (req, res) => {
  try {
    console.log("Received capture request for user:", req.body.userId);

    if (!fingerprintDevice) {
      if (!initializeScanner()) {
        throw new Error("Fingerprint scanner not available");
      }
    }

    // Try to reset the device before capture
    await resetDevice();

    // Start capture process
    console.log("Starting fingerprint capture...");
    const fingerprintData = await captureFingerprintData();
    console.log("Fingerprint captured successfully");

    // First, check if the user exists
    const { data: user, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("user_id", req.body.userId)
      .single();

    if (fetchError) {
      console.error("Error fetching user:", fetchError);
      throw new Error("Failed to fetch user");
    }

    if (!user) {
      console.error("User not found:", req.body.userId);
      throw new Error("User not found");
    }

    console.log("Found user, updating fingerprint data...");

    // Store in Supabase
    const { data, error } = await supabase
      .from("users")
      .update({
        fingerprint_data: fingerprintData,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", req.body.userId)
      .select();

    if (error) {
      console.error("Error updating user:", error);
      throw error;
    }

    console.log("Fingerprint data stored successfully");

    // Log the action in system_logs
    const { error: logError } = await supabase.from("system_logs").insert([
      {
        user_id: req.body.userId,
        action: "fingerprint_registration",
        message: "Fingerprint registered successfully",
        status: "success",
      },
    ]);

    if (logError) {
      console.error("Error logging action:", logError);
    }

    res.json({
      success: true,
      message: "Fingerprint captured and stored successfully",
    });
  } catch (error) {
    console.error("Error in fingerprint capture endpoint:", error);

    // Try to recover from pipe error
    if (
      error.message.includes("LIBUSB_ERROR_PIPE") ||
      error.message.includes("LIBUSB_ERROR_NOT_FOUND") ||
      error.message.includes("LIBUSB_ERROR_IO")
    ) {
      try {
        await resetDevice();
        if (initializeScanner()) {
          res.status(500).json({
            success: false,
            error: "Please try again - device has been reset",
          });
          return;
        }
      } catch (recoveryError) {
        console.error("Error during recovery:", recoveryError);
      }
    }

    // Log the error in system_logs
    if (req.body.userId) {
      const { error: logError } = await supabase.from("system_logs").insert([
        {
          user_id: req.body.userId,
          action: "fingerprint_registration",
          message: error.message,
          status: "failed",
        },
      ]);

      if (logError) {
        console.error("Error logging failure:", logError);
      }
    }

    res.status(500).json({
      success: false,
      error: error.message,
      details: error.details || error.hint || null,
    });
  }
});

// Endpoint to verify fingerprint
app.post("/api/fingerprint/verify", async (req, res) => {
  try {
    if (!fingerprintDevice) {
      if (!initializeScanner()) {
        throw new Error("Fingerprint scanner not available");
      }
    }

    const capturedPrint = await captureFingerprintData();

    // Get stored fingerprint from Supabase
    const { data, error } = await supabase
      .from("users")
      .select("fingerprint_data")
      .eq("id", req.body.userId)
      .single();

    if (error) throw error;

    // Compare fingerprints
    const isMatch = compareFingerprints(capturedPrint, data.fingerprint_data);

    res.json({ success: true, isMatch });
  } catch (error) {
    console.error("Error verifying fingerprint:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Simple fingerprint comparison (you'll need to implement proper comparison logic)
function compareFingerprints(print1, print2) {
  return print1 === print2;
}

// Cleanup on server shutdown
process.on("SIGINT", () => {
  if (fingerprintDevice) {
    try {
      const usbInterface = fingerprintDevice.interface(0);
      usbInterface.release(() => {
        fingerprintDevice.close();
        process.exit();
      });
    } catch (error) {
      console.error("Error closing fingerprint device:", error);
      process.exit();
    }
  } else {
    process.exit();
  }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  initializeScanner();
});
