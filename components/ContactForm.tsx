"use client"

import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import emailjs from '@emailjs/browser';

export default function ContactForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        const form = e.currentTarget;

        try {
            // Replace these with your actual EmailJS service, template, and public key
            await emailjs.sendForm(
                'portfolio',
                'contact template',
                form,
                '8rocLc3TOLdDP1Nov'
            );

            toast({
                title: "Message sent!",
                description: "Thank you for your message. I'll get back to you soon.",
            });

            form.reset();
        } catch (error) {
            console.error('Error sending email:', error);
            toast({
                title: "Failed to send message",
                description: "There was an error sending your message. Please try again later.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-4">Contact Me</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <Input
                        type="text"
                        name="from_name"
                        placeholder="Your Name"
                        required
                        className="w-full"
                    />
                </div>
                <div>
                    <Input
                        type="email"
                        name="from_email"
                        placeholder="Your Email"
                        required
                        className="w-full"
                    />
                </div>
                <div>
                    <Input
                        type="text"
                        name="subject"
                        placeholder="Subject"
                        required
                        className="w-full"
                    />
                </div>
                <div>
                    <Textarea
                        name="message"
                        placeholder="Your Message"
                        required
                        className="w-full min-h-[150px]"
                    />
                </div>
                <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
            </form>
        </div>
    );
} 