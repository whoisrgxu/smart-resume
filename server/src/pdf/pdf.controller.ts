import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PdfService, ResumeData } from './pdf.service';

@Controller('pdf')
export class PdfController {
  constructor(private readonly pdfService: PdfService) {}

  @Post('parse')
  @UseInterceptors(FileInterceptor('file'))
  async parsePDF(@UploadedFile() file: Express.Multer.File): Promise<ResumeData> {
    return this.pdfService.parsePDF(file);
  }
}
