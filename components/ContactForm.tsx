"use client"

import { useState, FormEvent, useRef, MouseEvent, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import emailjs from '@emailjs/browser';

export default function ContactForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [devMode, setDevMode] = useState(false);
    const [showAnimation, setShowAnimation] = useState(false);
    const [clickCoordinates, setClickCoordinates] = useState({ x: 0, y: 0 });
    const [isDevelopment, setIsDevelopment] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const { toast } = useToast();

    useEffect(() => {
        // Check if we're running in development mode
        setIsDevelopment(process.env.NODE_ENV === 'development');
    }, []);

    const handleButtonClick = (e: MouseEvent<HTMLButtonElement>) => {
        // Store the exact coordinates where the button was clicked
        setClickCoordinates({
            x: e.clientX,
            y: e.clientY
        });
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        const form = e.currentTarget;

        // Trigger animation from the click coordinates
        setShowAnimation(true);

        try {
            if (!devMode) {
                // Only send email if not in dev mode
                await emailjs.sendForm(
                    'portfolio',
                    'contact template',
                    form,
                    '8rocLc3TOLdDP1Nov'
                );
            } else {
                // Simulate API delay in dev mode
                await new Promise(resolve => setTimeout(resolve, 2500));
            }

            toast({
                title: devMode ? "Dev mode: Email not sent" : "Message sent!",
                description: devMode 
                    ? "Running in development mode. Email would have been sent." 
                    : "Thank you for your message. I'll get back to you soon.",
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
            // Hide animation after it completes (after animation is done)
            setTimeout(() => {
                setShowAnimation(false);
                setIsSubmitting(false);
            }, 3000);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto relative">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Contact Me</h2>
                {isDevelopment && (
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="dev-mode"
                            checked={devMode}
                            onCheckedChange={setDevMode}
                        />
                        <Label htmlFor="dev-mode">Dev Mode</Label>
                    </div>
                )}
            </div>
            
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
                    ref={buttonRef}
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                    onClick={handleButtonClick}
                >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
            </form>

            {/* Paper airplane animation */}
            {showAnimation && (
                <div 
                    className="absolute paper-airplane"
                    style={{
                        left: `${clickCoordinates.x}px`,
                        top: `${clickCoordinates.y}px`
                    }}
                >
                    <Image
                        src="/avatar/paper_airplane.png"
                        alt="Paper Airplane"
                        width={70}
                        height={70}
                        priority
                    />
                </div>
            )}

            {/* Add the animation CSS */}
            <style jsx>{`
                .paper-airplane {
                    position: fixed;
                    animation: fly 3s ease-in-out forwards;
                    z-index: 100;
                    transform: translate(-50%, -50%);
                }
                
                @keyframes fly {
                    0% {
                        transform: translate(-50%, -50%) rotate(0deg);
                        opacity: 1;
                    }
                    20% {
                        transform: translate(calc(-50% + 100px), -50%) rotate(15deg);
                        opacity: 1;
                    }
                    60% {
                        transform: translate(calc(-50% + 300px), calc(-50% - 50px)) rotate(30deg);
                        opacity: 1;
                    }
                    100% {
                        transform: translate(calc(100vw - 100px), -50%) rotate(45deg);
                        opacity: 0;
                    }
                }
            `}</style>
        </div>
    );
} 