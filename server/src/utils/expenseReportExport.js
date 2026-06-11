import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

const EXPORT_COLUMNS = [
    { key: 'title', header: 'Title', width: 28 },
    { key: 'amount', header: 'Amount', width: 14 },
    { key: 'date', header: 'Date', width: 14 },
    { key: 'category', header: 'Category', width: 18 },
    { key: 'type', header: 'Type', width: 18 },
    { key: 'paymentMethod', header: 'Payment Method', width: 16 },
    { key: 'description', header: 'Description', width: 32 },
];

const escapeCsvValue = (value) => {
    const str = value == null ? '' : String(value);
    if (/[",\n\r]/.test(str)) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
};

const formatAmount = (amount, currency) =>
    new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: currency || 'USD',
    }).format(amount ?? 0);

const buildCsv = (rows, currency) => {
    const header = EXPORT_COLUMNS.map((col) => escapeCsvValue(col.header)).join(',');
    const body = rows
        .map((row) =>
            EXPORT_COLUMNS.map((col) => {
                if (col.key === 'amount') return escapeCsvValue(formatAmount(row.amount, currency));
                return escapeCsvValue(row[col.key] ?? '');
            }).join(',')
        )
        .join('\n');

    const total = rows.reduce((sum, row) => sum + (row.amount || 0), 0);
    const footer = `\nTotal,,${escapeCsvValue(formatAmount(total, currency))},,,,`;

    return Buffer.from(`${header}\n${body}${footer}`, 'utf-8');
};

const buildXlsx = async (rows, currency) => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Expense Tracker';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Expenses');
    sheet.columns = EXPORT_COLUMNS.map((col) => ({
        header: col.header,
        key: col.key,
        width: col.width,
    }));

    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE8EEF7' },
    };

    rows.forEach((row) => {
        sheet.addRow({
            title: row.title,
            amount: row.amount,
            date: row.date,
            category: row.category,
            type: row.type,
            paymentMethod: row.paymentMethod || '',
            description: row.description || '',
        });
    });

    const total = rows.reduce((sum, row) => sum + (row.amount || 0), 0);
    const totalRow = sheet.addRow({
        title: 'Total',
        amount: total,
    });
    totalRow.font = { bold: true };

    sheet.getColumn('amount').numFmt = `"${currency || 'USD'}" #,##0.00`;

    return workbook.xlsx.writeBuffer();
};

const buildPdf = (rows, currency, meta = {}) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 40, size: 'A4' });
        const chunks = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

        doc.fontSize(20).font('Helvetica-Bold').text('Expense Report', { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(10).font('Helvetica').fillColor('#555555');
        doc.text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
        if (meta.generatedFor) {
            doc.text(`User: ${meta.generatedFor}`, { align: 'center' });
        }
        doc.moveDown(1);
        doc.fillColor('#000000');

        const total = rows.reduce((sum, row) => sum + (row.amount || 0), 0);
        doc.fontSize(12).font('Helvetica-Bold').text(`Total spent: ${formatAmount(total, currency)}`);
        doc.font('Helvetica').fontSize(10).text(`${rows.length} expense(s)`);
        doc.moveDown(1);

        rows.forEach((row, index) => {
            if (doc.y > doc.page.height - 120) {
                doc.addPage();
            }

            doc.font('Helvetica-Bold').fontSize(11).text(`${index + 1}. ${row.title}`);
            doc.font('Helvetica').fontSize(10);
            doc.text(`Amount: ${formatAmount(row.amount, currency)}`);
            doc.text(`Date: ${row.date || '—'}`);
            doc.text(`Category: ${row.category || '—'}  |  Type: ${row.type || '—'}`);
            if (row.paymentMethod) doc.text(`Payment: ${row.paymentMethod}`);
            if (row.description) {
                doc.text(`Description: ${row.description}`, {
                    width: pageWidth,
                });
            }
            doc.moveDown(0.75);
        });

        doc.end();
    });
};

const FORMAT_CONFIG = {
    csv: {
        contentType: 'text/csv; charset=utf-8',
        extension: 'csv',
        build: (rows, currency) => Promise.resolve(buildCsv(rows, currency)),
    },
    xlsx: {
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        extension: 'xlsx',
        build: buildXlsx,
    },
    excel: {
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        extension: 'xlsx',
        build: buildXlsx,
    },
    pdf: {
        contentType: 'application/pdf',
        extension: 'pdf',
        build: buildPdf,
    },
};

const generateExpenseReport = async (format, rows, options = {}) => {
    const normalizedFormat = format === 'excel' ? 'xlsx' : format;
    const config = FORMAT_CONFIG[normalizedFormat];

    if (!config) {
        throw new Error(`Unsupported export format: ${format}`);
    }

    const buffer = await config.build(rows, options.currency, options);
    const dateStamp = new Date().toISOString().slice(0, 10);

    return {
        buffer,
        contentType: config.contentType,
        filename: `expense-report-${dateStamp}.${config.extension}`,
    };
};

export default {
    generateExpenseReport,
};
