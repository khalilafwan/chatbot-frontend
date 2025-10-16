import { useVoiceChat } from "@/interfaces/useVoiceChat";
import { AnimatePresence, motion } from "framer-motion";
import { Mic, MicOff, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import axios from "axios";

export default function VoiceChatModal({ onVoiceComplete }: { onVoiceComplete?: () => void }) {
    const { isOpen, close } = useVoiceChat();
    const [isMuted, setIsMuted] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    useEffect(() => {
        if (isOpen) {
            startRecording();
        } else {
            stopRecording(); // Clean up if modal closes unexpectedly
        }
    }, [isOpen]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = handleUpload;

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            close();
        }
    };

    const stopRecording = () => {
        const recorder = mediaRecorderRef.current;
        if (recorder && recorder.state !== "inactive") {
            recorder.stop();
            setIsRecording(false);
        }
    };

    const handleUpload = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });

        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.play();
        const formData = new FormData();

        const token = localStorage.getItem("_auth");
        const authState = localStorage.getItem("_auth_state");
        const chatID = localStorage.getItem("chat_id");

        let userID = null;
        if (authState) {
            try {
                const parsed = JSON.parse(authState);
                userID = parsed.id;
            } catch (err) {
                console.error("Failed to parse _auth_state:", err);
            }
        }

        if (!token || !userID || !chatID) {
            console.error("Missing token, user_id, or chat_id");
            return;
        }

        const timestamp = Date.now();
        const filename = `voice-${timestamp}.webm`;
        formData.append("audio", audioBlob, filename);
        formData.append("user_id", userID.toString());
        formData.append("chat_id", chatID);

        try {
            await axios.post("http://localhost:8888/voice/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log("Audio uploaded successfully");
        } catch (error) {
            console.error("Error uploading audio:", error);
        }

        close(); // Tutup modal setelah upload
        if (onVoiceComplete) {
            onVoiceComplete();
        }
    };

    const toggleMute = () => {
        setIsMuted((prev) => !prev);
        const recorder = mediaRecorderRef.current;
        if (recorder && recorder.stream) {
            const audioTrack = recorder.stream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = isMuted;
            }
        }
    };

    const handleClose = () => {
        stopRecording();
        close();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-50 bg-black text-white flex flex-col items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    {/* Animated Voice Circle */}
                    <motion.div
                        className="rounded-full bg-gradient-to-br from-blue-400 to-white w-40 h-40"
                        animate={{
                            scale: [1, 1.15, 1],
                            boxShadow: [
                                "0 0 0px rgba(59,130,246,0.3)",
                                "0 0 40px rgba(59,130,246,0.7)",
                                "0 0 0px rgba(59,130,246,0.3)",
                            ],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                        }}
                    />

                    <p className="mt-6 text-sm text-gray-300">
                        {isMuted ? "Mic muted" : isRecording ? "Recording..." : "Idle"}
                    </p>

                    {/* Action Buttons */}
                    <div className="mt-10 flex gap-6">
                        <button
                            onClick={toggleMute}
                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isMuted
                                ? "bg-red-600 hover:bg-red-700"
                                : "bg-blue-600 hover:bg-blue-700"
                                }`}
                        >
                            {isMuted ? (
                                <MicOff className="w-5 h-5" />
                            ) : (
                                <Mic className="w-5 h-5" />
                            )}
                        </button>
                        <button
                            className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700"
                            onClick={handleClose}
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
