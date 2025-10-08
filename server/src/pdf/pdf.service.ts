import { Injectable } from '@nestjs/common';
import * as mammoth from 'mammoth';

export interface ResumeData {
  html: string;
  text: string;
}

@Injectable()
export class PdfService {
  async parsePDF(file: Express.Multer.File): Promise<ResumeData> {
    try {
      const result = await mammoth.convertToHtml(
        { buffer: file.buffer },
        {
          styleMap: [
            "p[style-name='Heading 1'] => h1:fresh",
            "p[style-name='Heading 2'] => h2:fresh",
            "p[style-name='Heading 3'] => h3:fresh",
            "p[style-name='Title'] => h1.title:fresh",
            "r[style-name='Strong'] => strong",
            "r[style-name='Emphasis'] => em",
          ],
          convertImage: mammoth.images.imgElement(function (image) {
            return image.read('base64').then(function (imageBuffer) {
              return {
                src: 'data:' + image.contentType + ';base64,' + imageBuffer,
              };
            });
          }),
        },
      );

      const html = this.enhanceHtml(result.value);
      const text = this.extractTextFromHtml(html);

      return {
        html,
        text,
      };
    } catch (error) {
      console.error('DOCX parsing error:', error);
      throw new Error('Failed to parse DOCX');
    }
  }

  private enhanceHtml(html: string): string {
    // Add CSS to preserve original formatting
    const enhancedHtml = `
      <style>
        body {
          font-family: 'Times New Roman', serif;
          line-height: 1.4;
          margin: 0;
          padding: 20px;
        }
        p {
          margin: 0 0 8px 0;
          white-space: pre-wrap;
        }
        h1, h2, h3, h4, h5, h6 {
          margin: 12px 0 8px 0;
          font-weight: bold;
        }
        ul, ol {
          margin: 8px 0;
          padding-left: 20px;
        }
        li {
          margin: 2px 0;
        }
        table {
          border-collapse: collapse;
          width: 100%;
          margin: 8px 0;
        }
        td, th {
          border: 1px solid #ddd;
          padding: 4px 8px;
          text-align: left;
        }
        .mammoth-page-break {
          page-break-before: always;
        }
        strong, b {
          font-weight: bold;
        }
        em, i {
          font-style: italic;
        }
        u {
          text-decoration: underline;
        }
      </style>
      <div class="resume-content">
        ${html}
      </div>
    `;

    return enhancedHtml;
  }

  private extractTextFromHtml(html: string): string {
    // Simple HTML to text conversion
    return html
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim();
  }
}
