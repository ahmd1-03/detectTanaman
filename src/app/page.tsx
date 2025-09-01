'use client';

import { useState, useRef, type ChangeEvent, useEffect } from 'react';
import Image from 'next/image';
import { UploadCloud, Camera, RefreshCw, AlertTriangle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast"
import { type DiagnosePlantOutput, diagnosePlant } from '@/ai/flows/diagnose-plant-flow';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PlantResultCard } from '@/components/plant-result-card';
import { ResultSkeleton } from '@/components/result-skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { ThemeToggle } from '@/components/theme-toggle';

type Step = 'initial' | 'upload' | 'camera' | 'loading' | 'result' | 'error';

export default function Home() {
  const [step, setStep] = useState<Step>('initial');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [plantDetails, setPlantDetails] = useState<DiagnosePlantOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);


  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (step === 'camera') {
      const getCameraPermission = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          setHasCameraPermission(true);
        } catch (error) {
          console.error('Error accessing camera:', error);
          setHasCameraPermission(false);
          toast({
            variant: 'destructive',
            title: 'Izin Kamera Ditolak',
            description: 'Mohon izinkan akses kamera di pengaturan browser Anda untuk menggunakan fitur ini.',
          });
          setStep('initial');
        }
      };
      getCameraPermission();
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
    }
  }, [step, toast]);


  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setImagePreview(dataUrl);
        processImage(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL('image/png');
        setImagePreview(dataUrl);
        processImage(dataUrl);
        setStep('loading');
      }
    }
  };
  
  const processImage = async (photoDataUri: string) => {
    setStep('loading');
    try {
      const result = await diagnosePlant({
        photoDataUri,
        description: "An image of a plant."
      });

      if (!result.identification.isPlant) {
         setStep('error');
         setError('Tanaman tidak dikenali. Silakan coba ulang dengan foto yang lebih jelas.');
         return;
      }
      
      setPlantDetails(result);
      setStep('result');
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'Terjadi kesalahan tidak diketahui.';
      toast({
        variant: "destructive",
        title: "Analisis Gagal",
        description: errorMessage,
      });
      setError(`Gagal menganalisis gambar. ${errorMessage}`);
      setStep('error');
    }
  };


  const handleReset = () => {
    setStep('initial');
    setImagePreview(null);
    setPlantDetails(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileSelect = () => fileInputRef.current?.click();

  const renderContent = () => {
    switch (step) {
      case 'initial':
        return (
          <Card className="w-full max-w-lg text-center shadow-lg animate-fade-in border-2 border-primary/20 bg-card/80 backdrop-blur-sm">
            <CardContent className="p-10 flex flex-col items-center gap-6">
              <div className="bg-primary/10 p-4 rounded-full">
                <LeafIcon className="w-10 h-10 text-primary" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold">Identifikasi Tanaman Anda</h2>
                <p className="text-muted-foreground">
                  Unggah gambar atau gunakan kamera untuk mengenali tanaman, mendiagnosa, dan mempelajari cara merawatnya.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full">
                <Button size="lg" onClick={triggerFileSelect} className="flex-1">
                  <UploadCloud className="mr-2" /> Unggah Gambar
                </Button>
                <Button size="lg" onClick={() => setStep('camera')} variant="outline" className="flex-1">
                   <Camera className="mr-2" /> Ambil Foto
                </Button>
              </div>
            </CardContent>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
          </Card>
        );
      case 'camera':
        return (
          <Card className="w-full max-w-2xl text-center shadow-lg animate-fade-in">
             <CardContent className="p-6 flex flex-col items-center gap-4">
               <h2 className="text-2xl font-semibold">Pindai Tanaman Anda</h2>
               <div className="w-full aspect-video rounded-md bg-muted overflow-hidden">
                  <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                  <canvas ref={canvasRef} className="hidden" />
               </div>
               {hasCameraPermission === false && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Akses Kamera Diperlukan</AlertTitle>
                    <AlertDescription>
                      Izinkan akses kamera di browser Anda untuk menggunakan fitur ini.
                    </AlertDescription>
                  </Alert>
               )}
                <Button size="lg" onClick={handleCapture} disabled={!hasCameraPermission}>
                  <Camera className="mr-2" /> Ambil Gambar & Analisis
                </Button>
             </CardContent>
          </Card>
        )
      case 'loading':
        return <ResultSkeleton />;
      case 'result':
        if (plantDetails && imagePreview) {
          return (
            <PlantResultCard
              plant={plantDetails}
              imagePreview={imagePreview}
              onReset={handleReset}
            />
          );
        }
        setStep('error');
        setError('Terjadi kesalahan saat menyiapkan hasil.');
        return null;
      case 'error':
        return (
           <Card className="w-full max-w-lg text-center shadow-lg animate-fade-in">
            <CardContent className="p-10 flex flex-col items-center gap-6">
               <div className="bg-destructive/10 p-4 rounded-full">
                <AlertTriangle className="w-10 h-10 text-destructive"/>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-destructive">Deteksi Gagal</h2>
                <p className="text-muted-foreground">
                  {error || "Tidak dapat memproses permintaan Anda. Silakan coba lagi."}
                </p>
              </div>
              <Button size="lg" onClick={handleReset} variant="destructive">
                Coba Lagi
              </Button>
            </CardContent>
          </Card>
        )
      default:
        return null;
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8 relative bg-background">
       <div className="absolute inset-0 -z-10 h-full w-full bg-background">
          <Image 
            src="https://images.unsplash.com/photo-1528183429752-a97d0bfbe25c?q=80&w=2070&auto=format&fit=crop"
            alt="Lush green foliage background"
            fill
            style={{objectFit:"cover"}}
            quality={80}
            className="opacity-10 dark:opacity-5"
          />
       </div>

      <header className="w-full max-w-5xl mx-auto mb-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo className="w-10 h-10 text-primary" />
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Flora<span className="text-primary">Vision</span>
          </h1>
        </div>
        <div className='flex items-center gap-2'>
          {step !== 'initial' && (
            <Button variant="outline" onClick={handleReset} className="bg-card/80 backdrop-blur-sm">
              <RefreshCw className="mr-2 h-4 w-4" /> Mulai Lagi
            </Button>
          )}
          <ThemeToggle />
        </div>
      </header>
      <div className="flex-grow flex items-center justify-center w-full">
        {renderContent()}
      </div>
      <footer className="w-full max-w-5xl mx-auto mt-12 text-center text-sm text-muted-foreground">
        <p className="py-2 px-4 rounded-md bg-card/80 backdrop-blur-sm inline-block">&copy; {new Date().getFullYear()} Flora Vision. All rights reserved.</p>
      </footer>
    </main>
  );
}

function LeafIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 20A7 7 0 0 1 4 13V8a5 5 0 0 1 5-5h1" />
      <path d="M11 20v-1a2 2 0 0 1 2-2h4a5 5 0 0 0 5-5V7" />
    </svg>
  )
}
