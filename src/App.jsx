import React, { useState } from 'react';
 import { PDFDocument } from 'pdf-lib';
 import { useDropzone } from 'react-dropzone';
 import './App.css';
 
 function App() {
   const [files, setFiles] = useState([]);
   const [singlePageFile, setSinglePageFile] = useState(null);
 
   const onDrop = (acceptedFiles) => {
     setFiles(acceptedFiles);
   };
 
   const onSinglePageDrop = (acceptedFiles) => {
     setSinglePageFile(acceptedFiles[0]);
   };
 
   const mergePDFs = async () => {
     if (!singlePageFile || files.length === 0) {
       alert('Please upload both the single-page PDF and the other PDF files.');
       return;
     }
 
     const singlePagePdfBytes = await singlePageFile.arrayBuffer();
     const singlePagePdf = await PDFDocument.load(singlePagePdfBytes);
 
     for (const file of files) {
       const pdfBytes = await file.arrayBuffer();
       const pdf = await PDFDocument.load(pdfBytes);
       const mergedPdf = await PDFDocument.create();
 
       const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
       copiedPages.forEach((page) => mergedPdf.addPage(page));
 
       const copiedSinglePage = await mergedPdf.copyPages(singlePagePdf, singlePagePdf.getPageIndices());
       copiedSinglePage.forEach((page) => mergedPdf.addPage(page));
 
       const mergedPdfBytes = await mergedPdf.save();
       const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
       const url = URL.createObjectURL(blob);
       const link = document.createElement('a');
       link.href = url;
       link.download =  `merged_${file.name}`;
       document.body.appendChild(link);
       link.click();
       document.body.removeChild(link);
     }
   };
 
   return (
     <div className="App">
       <h1>PDF Merger</h1>
       <div className="dropzone">
         <h2>Upload the single-page PDF:</h2>
         <Dropzone onDrop={onSinglePageDrop} accept=".pdf" />
       </div>
       <div className="dropzone">
         <h2>Upload the PDF files to merge:</h2>
         <Dropzone onDrop={onDrop} accept=".pdf" multiple />
       </div>
       <button onClick={mergePDFs} disabled={!singlePageFile || files.length === 0}>
         Merge PDFs
       </button>
     </div>
   );
 }
 
 const Dropzone = ({ onDrop, accept, multiple = false }) => {
   const { getRootProps, getInputProps } = useDropzone({ onDrop, accept, multiple });
 
   return (
     <div {...getRootProps({ className: 'dropzone-container' })}>
       <input {...getInputProps()} />
       <p>Drag 'n' drop some files here, or click to select files</p>
     </div>
   );
 };
 
 export default App;