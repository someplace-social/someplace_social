import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize Resend with the API key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY);
const recipientEmail = process.env.EMAIL_RECIPIENT;

export async function POST(request: Request) {
  try {
    if (!recipientEmail) {
      throw new Error('Recipient email is not configured.');
    }

    const body = await request.json();
    const { formType, message } = body;

    const { data, error } = await resend.emails.send({
      from: 'Someplace Social <onboarding@resend.dev>', // Resend requires this domain
      to: recipientEmail,
      subject: `New Form Submission: ${formType}`,
      text: message, // The plain text content of the email
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ success: false, message: 'Error sending email.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Form submitted successfully.' });
  } catch (error) {
    console.error('Error processing form:', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}