import Image from 'next/image';
import { Leaf, Heart, ShieldCheck, RefreshCw, ShieldAlert, Sun, Droplets } from 'lucide-react';
import { type DiagnosePlantOutput } from '@/ai/flows/diagnose-plant-flow';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from './ui/separator';

interface PlantResultCardProps {
  plant: DiagnosePlantOutput;
  imagePreview: string;
  onReset: () => void;
}

export function PlantResultCard({
  plant,
  imagePreview,
  onReset,
}: PlantResultCardProps) {
  const { identification, diagnosis, care } = plant;

  return (
    <Card className="w-full max-w-4xl overflow-hidden shadow-2xl animate-fade-in-up">
      <div className="grid md:grid-cols-2">
        <div className="relative">
          <Image
            src={imagePreview}
            alt={`Uploaded image of ${identification.commonName}`}
            width={600}
            height={600}
            className="object-cover w-full h-64 md:h-full"
            data-ai-hint={`${identification.commonName} plant`}
          />
           <Badge 
            variant={diagnosis.isHealthy ? "default" : "destructive"} 
            className="absolute top-4 left-4"
          >
            {diagnosis.isHealthy ? 
              <><ShieldCheck className="mr-2" />Sehat</> : 
              <><ShieldAlert className="mr-2" />Butuh Perhatian</>
            }
          </Badge>
        </div>
        <div className="flex flex-col">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-3xl font-bold text-primary">{identification.commonName}</CardTitle>
                <CardDescription className="text-base italic">{identification.scientificName}</CardDescription>
              </div>
              <Badge variant="secondary" className="whitespace-nowrap">{identification.category}</Badge>
            </div>
          </CardHeader>

          <CardContent className="flex-grow space-y-6 pt-0">
            <div>
              <h3 className="flex items-center gap-2 text-lg font-semibold mb-2">
                <Leaf className="w-5 h-5 text-accent" />
                Diagnosa Kesehatan
              </h3>
              <p className="text-muted-foreground">{diagnosis.healthDescription}</p>
            </div>
            
            <Separator />

            <Accordion type="single" collapsible className="w-full" defaultValue='item-1'>
              <AccordionItem value="item-1">
                <AccordionTrigger className='text-lg font-semibold'>
                  <div className='flex items-center gap-2'>
                    <Heart className="w-5 h-5 text-accent" />
                    Manfaat & Kegunaan
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                   <p className="text-muted-foreground text-base">{care.benefits}</p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                 <AccordionTrigger className='text-lg font-semibold'>
                  <div className='flex items-center gap-2'>
                    <Sun className="w-5 h-5 text-accent" />
                    Panduan Perawatan
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold flex items-center gap-2"><Droplets className="w-4 h-4" />Penyiraman</h4>
                    <p className="text-muted-foreground text-base">{care.watering}</p>
                  </div>
                   <div>
                    <h4 className="font-semibold flex items-center gap-2"><Sun className="w-4 h-4" />Sinar Matahari</h4>
                    <p className="text-muted-foreground text-base">{care.sunlight}</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>

          <CardFooter className="bg-muted/50 p-4">
            <Button size="lg" className="w-full" onClick={onReset}>
              <RefreshCw className="mr-2 h-4 w-4" /> Deteksi Tanaman Lain
            </Button>
          </CardFooter>
        </div>
      </div>
    </Card>
  );
}
