const fs = require("fs");
const path = require("path");
const QRCode = require("qrcode");
const PDFDocument = require("pdfkit");
const { v4: uuidv4 } = require("uuid");

<<<<<<< HEAD
async function generateEpass(visitor) {
=======
async function generateEpass(visitor, link) {
>>>>>>> d205e47 (Remove node_modules and add to gitignore)
  const epassId = uuidv4();
  const qrPath = path.join(__dirname, `../tmp/${epassId}.png`);
  const pdfPath = path.join(__dirname, `../tmp/${epassId}.pdf`);

<<<<<<< HEAD
  // Generate QR
  await QRCode.toFile(qrPath, `Epass ID: ${epassId}, Visitor: ${visitor.name}`);
=======
  // Generate QR with link (if link provided) or use default link to frontend epass page
  const base = link || process.env.FRONTEND_URL || `http://localhost:5173`;
  const frontendLink = `${base.replace(/\/$/, "")}/epass/${epassId}`;
  await QRCode.toFile(qrPath, frontendLink);
>>>>>>> d205e47 (Remove node_modules and add to gitignore)

  // Generate PDF
  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream(pdfPath));
  doc.fontSize(20).text("Visitor E-Pass", { align: "center" });
  doc.moveDown();
  doc.text(`Name: ${visitor.name}`);
  doc.text(`Email: ${visitor.email}`);
  doc.text(`Phone: ${visitor.phone}`);
  doc.text(`Epass ID: ${epassId}`);
  doc.image(qrPath, { fit: [200, 200], align: "center" });
  doc.end();

  return { epassId, pdfPath };
}

module.exports = generateEpass;
