import nodemailer from 'nodemailer';
import ejs from 'ejs';
import dotenv from 'dotenv';
import path from 'path';


dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});


function renderTemplate(templateName: string, data: Record<string, any>): Promise<string> {
    const filePath = path.join(__dirname, '..', 'templates', `${templateName}.ejs`);
    console.log(`Rendering template: ${filePath}`);
    return ejs.renderFile(filePath, data);
}

export async function sendBookingEmails(
    emailData: {
        bookingReference: string;
        firstName: string;
        lastName: string;
        email: string;
        total: number;
        phone: string;
        nights?: number;
        paymentMethod: string;
        checkIn: string;
        checkOut: string;
        specialRequests?: string;
        rooms: any[];
    },
    options: {
        recipient: 'admin' | 'guest' | 'both';
        req?: any;
    }
) {
    const {
        bookingReference,
        firstName,
        lastName,
        email,
        total,
        phone,
        nights,
        paymentMethod,
        checkIn,
        checkOut,
        specialRequests = 'None',
        rooms,
    } = emailData;

    const { recipient = 'both', req } = options;

    try {
        // Send email to guest if recipient is 'guest' or 'both'
        if (recipient === 'guest' || recipient === 'both') {
            const guestHtml = await renderTemplate('guest', {
                bookingReference,
                firstName,
                lastName,
                checkIn,
                nights,
                checkOut,
                total,
                paymentMethod,
                specialRequests,
                rooms,
            });

            await transporter.sendMail({
                from: `"Hotel JanakpurInn" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: `Booking Confirmation #${bookingReference}`,
                html: guestHtml,
            });
            console.log(`Sent booking confirmation to guest: ${email}`);
        }

        // Send email to admin if recipient is 'admin' or 'both'
        if (recipient === 'admin' || recipient === 'both') {
            const adminHtml = await renderTemplate('admin', {
                bookingReference,
                firstName,
                lastName,
                phone,
                email,
                checkIn,
                checkOut,
                paymentMethod,
                specialRequests,
                total,
                rooms,
                adminNote: 'New booking received. Please review the details below:',
                ipAddress: req?.ip || 'Unknown',
                userAgent: req?.get('User-Agent') || 'Unknown',
                timestamp: new Date().toISOString(),
            });

            await transporter.sendMail({
                from: `"Booking System" <${process.env.EMAIL_USER}>`,
                to: process.env.ADMIN_EMAIL,
                subject: `[New Booking] #${bookingReference} - ${firstName} ${lastName}`,
                html: adminHtml,
                text: `New booking received:\n\nReference: ${bookingReference}\nGuest: ${firstName} ${lastName}\nAmount: NPR ${total}`,
            });
            console.log(`📧 Sent booking notification to admin`);
        }

    } catch (emailError) {
        console.error('📧 Email sending failed:', emailError);
        throw emailError; // Re-throw if you want calling code to handle the error
    }
}
