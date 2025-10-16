import { useRef, useState } from 'react';

export function useRecorder(onStop: (blob: Blob) => void) {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });

    mediaRecorder.ondataavailable = (event) => {
      chunksRef.current.push(event.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
      onStop(blob);
      chunksRef.current = [];
      stream.getTracks().forEach(track => track.stop()); // stop mic
    };

    mediaRecorderRef.current = mediaRecorder;
    chunksRef.current = [];
    mediaRecorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  return {
    startRecording,
    stopRecording,
    isRecording,
  };
}