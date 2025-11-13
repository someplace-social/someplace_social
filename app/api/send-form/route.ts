import { NextResponse } from 'next/server';

// This function will be triggered when a POST request is made to /api/send-form
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { formType, message } = body;

    // In a real application, you would use a service like Resend, SendGrid, or Nodemailer
    // to send an email here. For now, we will just log the data to the server console.
    // This demonstrates that the backend is receiving the data correctly.
    
    console.log('--- FORM SUBMISSION ---');
    console.log('Form Type:', formType);
    console.log('Message:', message);
    console.log('Recipient:', process.env.EMAIL_RECIPIENT); // Example of using an environment variable
    console.log('-----------------------');
    
    // You would add your email sending logic here.
    // For example, using Resend:
    // await resend.emails.send({
    //   from: 'onboarding@resend.dev',
    //   to: process.env.EMAIL_RECIPIENT,
    //   subject: `New Submission: ${formType}`,
    //   text: message,
    // });

    return NextResponse.json({ success: true, message: 'Form submitted successfully.' });
  } catch (error) {
    console.error('Error processing form:', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}