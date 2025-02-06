"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import CandidateInfoDialog from "@/components/CandidateInfoDialog"
import { Html5Qrcode } from "html5-qrcode"
import { X } from "lucide-react"

export default function InductionProcess({ params }: { params: { panelName: string } }) {
  const [showScanner, setShowScanner] = useState(false)
  const [scannedData, setScannedData] = useState<string | null>(null)


  const [scanSuccess, setScanSuccess] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);


  useEffect(() => {
    // Get available cameras
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices.length > 0) {
          console.log(devices)
        }
      })
      .catch(console.error)
  }, [])
    
      const scannerRef = useRef<HTMLDivElement>(null);
      const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
      useEffect(() => {
        if (isModalOpen && scannerRef.current && !scanSuccess) {
          const config = { fps: 10, qrbox: 250 };
          const html5QrCode = new Html5Qrcode("qr-reader");
          html5QrCodeRef.current = html5QrCode;
    
          html5QrCode
            .start(
              "e74022265b858b289553639f7a73beddaff8bd294e7d5ac4f2c19288c243001e",
            //   { facingMode: "environment" },
              config,
              (decodedText, decodedResult) => {
                console.log(`Code matched = ${decodedText}`, decodedResult);
                handleScan(decodedText);
                // Removed the stop call here
              },
              (errorMessage) => {
                // parse error, ignore it.
                console.warn(`QR Code no longer in front of camera.`, errorMessage);
              }
            )
            .catch((err) => {
              // Start failed, handle it.
              console.error(`Unable to start scanning, error: ${err}`);
              alert("Unable to access camera for scanning. Please check permissions.");
            });
        }
    
        // Cleanup function to stop the scanner when the modal closes
        return () => {
          if (html5QrCodeRef.current) {
            html5QrCodeRef.current.stop().then(() => {
              html5QrCodeRef.current?.clear();
              html5QrCodeRef.current = null;
            }).catch(err => {
              console.error("Error stopping QR scanner:", err);
            });
          }
        };
      }, [isModalOpen, scanSuccess]);
    
      // Function to handle QR scan result
      const handleScan = (data: string) => {
        if (data) {
          console.log("Scanned QR Code:", data);
          setScannedData(data);
          setScanSuccess(true);
          // Optionally, close the modal after a delay
        }
      };
      const closeModal = () => {
        setIsModalOpen(false);
        setScanSuccess(false);
        setScannedData("");
      };
    
  return (
    <div className="min-h-screen bg-[#FDF7F4] p-6">
      <h1 className="text-3xl font-bold text-[#76232F] mb-6">
        Induction Process: {decodeURIComponent(params.panelName)}
      </h1>
      <Button onClick={() => setIsModalOpen(true)} className="bg-[#76232F] hover:bg-[#76232F]/90 text-white">
        Scan for Induction
      </Button>

      {/* ------------------------ QR Scanner Modal -------------------- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 relative w-11/12 max-w-md">
            {/* Close Button */}
            <Button
              onClick={closeModal}
              className="absolute top-2 right-2 ml-4 p-2"
              aria-label="Close Modal"
              variant="outline"
              title="Close"
            >
              {/* <XIcon className="h-6 w-6" /> */}
              <X/>
            </Button>

            {/* Conditional Rendering based on scanSuccess */}
            {!scanSuccess ? (
              <>
                <h2 className="text-xl font-semibold mb-4 text-black">Scan QR Code</h2>
                <div id="qr-reader" ref={scannerRef}></div>
              </>
            ) : (
              <div className="flex flex-col items-center">
                {/* <CheckCircleIcon className="h-12 w-12 text-green-500 mb-4" /> */}
                <img src="https://cdn.dribbble.com/users/129972/screenshots/2888283/74_03_smile.gif"/>
                <h2 className="text-xl font-semibold mb-2 text-black">Submission Successful!</h2>
                <p className="text-gray-700">Proceed with nect induction</p>
              </div>
            )}

            
          </div>
        </div>
      )}


      {scannedData && <CandidateInfoDialog panelName={params.panelName} scannedData={scannedData} onClose={() => setScannedData(null)} />}
    </div>
  )
}

