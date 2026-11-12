import { NextResponse } from 'next/server';
import { Resend } from 'resend';
const recipientEmail = process.env.EMAIL_RECIPIENT;
export async function POST(request: Request) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('Resend API key is not configured.');
    }
    if (!recipientEmail) {
      throw new Error('Recipient email is not configured.');
    }
    const resend = new Resend(apiKey);
    const body = await request.json();
    const { formType, message } = body;
    const { error } = await resend.emails.send({
      from: 'Someplace Social <onboarding@resend.dev>',
      to: recipientEmail,
      subject: `New Form Submission: ${formType}`,
      text: message,
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