export const generateCashInOutDocx = async ({ products = [], bookId = "" }) => {
  const {
    Document,
    Packer,
    Paragraph,
    TextRun,
    Table,
    TableRow,
    TableCell,
    WidthType,
  } = await import("docx");

  const title = new Paragraph({
    children: [
      new TextRun({ text: "Cash In/Out Report", bold: true, size: 28 }),
    ],
  });

  const meta1 = new Paragraph({
    children: [new TextRun({ text: `BookId: ${bookId || "-"}`, size: 22 })],
  });

  const meta2 = new Paragraph({
    children: [
      new TextRun({ text: `Total Rows: ${products.length}`, size: 22 }),
    ],
  });

  const headerRow = new TableRow({
    children: ["#", "Payment Mode", "Status", "Remarks", "Amount"].map(
      (t) =>
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({ text: t, bold: true })],
            }),
          ],
        })
    ),
  });

  const bodyRows = products.map((p, idx) => {
    const rowData = [
      String(idx + 1),
      p.paymentMode || "-",
      p.paymentStatus || "-",
      p.remarks || "-",
      Number(p.amount || 0).toFixed(2),
    ];

    return new TableRow({
      children: rowData.map(
        (t) =>
          new TableCell({
            children: [new Paragraph(String(t))],
          })
      ),
    });
  });

  const table = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...bodyRows],
  });

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [title, meta1, meta2, new Paragraph(""), table],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  return blob;
};
