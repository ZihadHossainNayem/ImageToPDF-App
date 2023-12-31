import React, { useState, useRef } from "react";
import Modal from "react-modal";
import jsPDF from "jspdf";
import Dropzone from "react-dropzone";
import {
  PiUploadSimpleLight,
  PiTrashLight,
  PiDownloadSimple,
} from "react-icons/pi";
import { MdClose } from "react-icons/md";
import { AiOutlineZoomIn } from "react-icons/ai";

export const ImgToPdf = () => {
  const [images, setImages] = useState([]);
  const [margin, setMargin] = useState("no-margin");
  const [loading, setLoading] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState("#ffffff"); // Default background color is white
  const [errorMessage, setErrorMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [zoomedIndex, setZoomedIndex] = useState(0);

  const handleImageDrop = (acceptedFiles) => {
    setErrorMessage(""); // Clear the error message if new image added to the box
    const updatedImages = images.concat(acceptedFiles);
    setImages(updatedImages);
  };

  const handleConvertToPdf = async (container) => {
    if (images.length === 0) {
      setErrorMessage("No images to convert!");
      return;
    }
    setLoading(true);

    const pdf = new jsPDF({
      unit: "px",
      format: "a4",
    });

    let marginLeft = 0;
    let marginTop = 0;

    if (margin === "low-margin") {
      marginLeft = 10;
      marginTop = 10;
    } else if (margin === "medium-margin") {
      marginLeft = 30;
      marginTop = 30;
    } else if (margin === "big-margin") {
      marginLeft = 70;
      marginTop = 70;
    }

    for (const image of images) {
      const img = new Image();
      img.src = URL.createObjectURL(image);

      await new Promise((resolve) => {
        img.onload = resolve;
      });

      container.innerHTML = ""; // Clear previous content
      container.appendChild(img);

      const maxWidth = pdf.internal.pageSize.getWidth() - marginLeft * 2;
      const maxHeight = pdf.internal.pageSize.getHeight() - marginTop * 2;

      let targetWidth = img.width;
      let targetHeight = img.height;

      // Resize the image if it exceeds the PDF page dimensions
      if (targetWidth > maxWidth) {
        targetWidth = maxWidth;
        targetHeight = (img.height * targetWidth) / img.width;
      }

      if (targetHeight > maxHeight) {
        targetHeight = maxHeight;
        targetWidth = (img.width * targetHeight) / img.height;
      }

      // Calculate horizontal and vertical offsets to apply margins
      const offsetX = marginLeft + (maxWidth - targetWidth) / 2;
      const offsetY = marginTop + (maxHeight - targetHeight) / 2;

      // Add the background color to the PDF
      pdf.setFillColor(backgroundColor);
      pdf.rect(
        0,
        0,
        pdf.internal.pageSize.getWidth(),
        pdf.internal.pageSize.getHeight(),
        "F"
      );

      // Add the resized image to the PDF with the calculated offsets
      pdf.addImage(
        img,
        "JPEG",
        offsetX,
        offsetY,
        targetWidth,
        targetHeight,
        undefined,
        "FAST"
      );

      pdf.addPage();
    }

    pdf.deletePage(pdf.internal.getNumberOfPages());
    pdf.save("converted.pdf");

    setLoading(false);
  };

  /* handling delete images from upload */
  const handleDeleteImage = (index) => {
    const updatedImages = [...images];
    updatedImages.splice(index, 1);
    setImages(updatedImages);
  };

  /* handling image zooming */
  /* image zoom */
  const handleZoomImage = (index) => {
    setShowModal(true);
    setZoomedIndex(index);
  };

  const containerRef = useRef(null);

  return (
    <div className="container mx-auto my-12">
      <div className="mx-4">
        <div>
          <h1 className="text-center text-3xl font-semibold mb-8 border-b border-red-500 pb-4">
            Image to PDF{" "}
          </h1>
        </div>

        <div className="flex flex-wrap md:gap-10 gap-4 items-center mb-8 justify-center">
          {/* margin selection */}
          <div>
            <span className="pr-2"> Margin:</span>
            <select
              onChange={(e) => setMargin(e.target.value)}
              className="border-b border-white hover:border-red-500 pb-1 outline-none"
            >
              <option value="no-margin">No Margin</option>
              <option value="low-margin">Low Margin</option>
              <option value="medium-margin">Low Margin</option>
              <option value="big-margin">Big Margin</option>
            </select>
          </div>

          {/* Background color selection */}
          <label className="flex items-center gap-2 pb-1">
            Background Color:
            <input
              type="color"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
            />
          </label>
          {/* pdf convert button */}
          <button
            onClick={() => handleConvertToPdf(containerRef.current)}
            className="border border-white hover:border-red-500 px-4 py-2 rounded bg-red-500 hover:bg-white text-white hover:text-red-500 font-semibold flex items-center gap-1"
          >
            {loading ? "Generating PDF..." : "Convert to PDF"}
            {loading ? null : <PiDownloadSimple className="text-xl" />}
          </button>
        </div>
        {/* error message if there is no image */}
        {errorMessage && (
          <p className="text-red-500 font-semibold pb-3">{errorMessage}</p>
        )}
        {/* drop box for image */}
        <div className="bg-gray-100">
          <Dropzone onDrop={handleImageDrop}>
            {({ getRootProps, getInputProps }) => (
              <div
                {...getRootProps()}
                className="bg-gray-100 p-20 h-300 flex flex-col justify-center items-center"
                style={{
                  border: "1px dashed #363636 ",
                  borderStyle: "dashed",
                  borderWidth: "2px",
                }}
              >
                <input {...getInputProps()} />
                <div className="flex items-center justify-center flex-col gap-4">
                  <PiUploadSimpleLight className="text-5xl" />
                  <p className="text-center">
                    Drag and drop images here, or click to select files from
                    device
                  </p>
                </div>
              </div>
            )}
          </Dropzone>
        </div>

        <div ref={containerRef} style={{ display: "none" }}></div>

        <div className="flex flex-wrap justify-start items-center mt-8">
          {images.map((image, index) => (
            <div key={index} className="relative mr-2 mb-2">
              <img
                src={URL.createObjectURL(image)}
                alt={`Category ${index + 1}`}
                className="w-[150px]"
              />
              {/* zoom and delete button on the images */}
              <div className="absolute top-1 left-1 flex flex-col items-center justify-center">
                <div className="flex gap-4">
                  <div>
                    <button
                      onClick={() => handleZoomImage(index)}
                      className="bg-red-500 text-white rounded-full p-2 w-9 h-9 flex items-center justify-center group"
                    >
                      <AiOutlineZoomIn className="group-hover:scale-125" />
                    </button>
                  </div>
                  <div>
                    <button
                      onClick={() => handleDeleteImage(index)}
                      className="bg-red-500 text-white rounded-full p-2 w-9 h-9 flex items-center justify-center group"
                    >
                      <PiTrashLight className="group-hover:scale-125" />
                    </button>
                  </div>
                </div>
              </div>
              {/* Modal to display the full-size image */}
              <Modal
                isOpen={showModal}
                onRequestClose={() => setShowModal(false)}
                contentLabel="Zoomed Image"
              >
                <button
                  onClick={() => {
                    setShowModal(false);
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-[50%] p-2"
                >
                  <MdClose size={25} />
                </button>
                <div className="w-full h-full flex items-center justify-center">
                  <img
                    src={URL.createObjectURL(images[zoomedIndex])}
                    alt={`Zoomed Image ${zoomedIndex + 1}`}
                    className="max-w-full max-h-full"
                  />
                </div>
              </Modal>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
