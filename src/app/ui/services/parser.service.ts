import { Injectable } from '@angular/core';
import DOMPurify from 'dompurify';
import * as smd from 'streaming-markdown';

@Injectable({
    providedIn: 'root'
})
export class ParserService {
    parser: smd.Parser | undefined = undefined;
    chunks = '';

    initParser(element: HTMLElement): void {
      const markdown_renderer = smd.default_renderer(element);
      this.parser = smd.parser(markdown_renderer);
    }

    hasParser(): boolean {
      return !!this.parser;
    }

    writeToElement(chunk: string) {
        if (!this.parser) {
            console.log('No parser, return');
            return;
        }

        if (!chunk && !this.parser.pending) {
            console.log('Empty chunk and parser does not have pending character, return');
            return;
        }

        this.chunks = this.chunks + chunk;
        DOMPurify.sanitize(this.chunks);
        if (DOMPurify.removed.length) {
            smd.parser_end(this.parser);
            return;
        }

        smd.parser_write(this.parser, chunk);
    }

    flushAll() {
      if (this.parser?.pending.length) {
        smd.parser_end(this.parser);
      }
      this.parser = undefined;
      this.chunks = '';
    }
}
