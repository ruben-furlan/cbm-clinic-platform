import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  OnInit,
} from '@angular/core';

@Component({
  selector: 'app-simple-editor',
  standalone: true,
  template: `
    <div class="simple-editor">

      <!-- Barra de herramientas -->
      <div class="simple-editor__toolbar">

        <button type="button"
                (click)="format('bold')"
                [class.active]="isActive('bold')"
                title="Negrita">
          <strong>N</strong>
        </button>

        <button type="button"
                (click)="format('italic')"
                [class.active]="isActive('italic')"
                title="Cursiva">
          <em>C</em>
        </button>

        <button type="button"
                (click)="format('underline')"
                [class.active]="isActive('underline')"
                title="Subrayado">
          <u>S</u>
        </button>

        <div class="simple-editor__separator"></div>

        <button type="button"
                (click)="formatBlock('h2')"
                title="Título">
          T
        </button>

        <div class="simple-editor__separator"></div>

        <button type="button"
                (click)="insertList('insertUnorderedList')"
                title="Lista">
          ☰
        </button>

        <button type="button"
                (click)="insertList('insertOrderedList')"
                title="Lista numerada">
          1.
        </button>

        <div class="simple-editor__separator"></div>

        <button type="button"
                (click)="insertLink()"
                title="Enlace">
          🔗
        </button>

        <div class="simple-editor__separator"></div>

        <button type="button"
                (click)="clearFormat()"
                title="Limpiar formato">
          ✕
        </button>

      </div>

      <!-- Área de escritura -->
      <div class="simple-editor__content"
           #editorContent
           contenteditable="true"
           [attr.data-placeholder]="placeholder"
           (input)="onInput()"
           (keydown)="onKeydown($event)">
      </div>

    </div>
  `,
  styles: [`
    .simple-editor {
      border: 1.5px solid #e5e7eb;
      border-radius: 10px;
      overflow: hidden;
    }

    .simple-editor__toolbar {
      display: flex;
      align-items: center;
      gap: 2px;
      padding: 8px 12px;
      background: #f9fafb;
      border-bottom: 1px solid #e5e7eb;
      flex-wrap: wrap;
    }

    .simple-editor__toolbar button {
      width: 32px;
      height: 32px;
      border: none;
      background: transparent;
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
      color: #374151;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 150ms;
    }

    .simple-editor__toolbar button:hover {
      background: #e5e7eb;
    }

    .simple-editor__toolbar button.active {
      background: #e9d5ff;
      color: #7c3aed;
    }

    .simple-editor__separator {
      width: 1px;
      height: 20px;
      background: #e5e7eb;
      margin: 0 4px;
    }

    .simple-editor__content {
      min-height: 200px;
      padding: 16px;
      font-size: 15px;
      color: #374151;
      line-height: 1.7;
      outline: none;
    }

    .simple-editor__content:empty::before {
      content: attr(data-placeholder);
      color: #9ca3af;
      pointer-events: none;
    }

    .simple-editor__content h2 {
      font-size: 18px;
      font-weight: 700;
      margin: 16px 0 8px;
    }

    .simple-editor__content ul,
    .simple-editor__content ol {
      padding-left: 20px;
      margin: 8px 0;
    }

    .simple-editor__content a {
      color: #a855f7;
      text-decoration: underline;
    }
  `],
})
export class SimpleEditorComponent implements OnInit {
  @Input() placeholder = 'Escribe aquí...';
  @Input() initialValue = '';
  @Output() contentChange = new EventEmitter<string>();

  @ViewChild('editorContent') editorContent!: ElementRef<HTMLDivElement>;

  ngOnInit(): void {
    if (this.initialValue) {
      setTimeout(() => {
        this.editorContent.nativeElement.innerHTML = this.initialValue;
      });
    }
  }

  format(command: string): void {
    document.execCommand(command, false);
    this.editorContent.nativeElement.focus();
    this.onInput();
  }

  formatBlock(tag: string): void {
    document.execCommand('formatBlock', false, tag);
    this.editorContent.nativeElement.focus();
    this.onInput();
  }

  insertList(command: string): void {
    document.execCommand(command, false);
    this.editorContent.nativeElement.focus();
    this.onInput();
  }

  insertLink(): void {
    const url = prompt('Introduce la URL:');
    if (url) {
      document.execCommand('createLink', false, url);
      this.onInput();
    }
  }

  clearFormat(): void {
    document.execCommand('removeFormat', false);
    document.execCommand('formatBlock', false, 'p');
    this.onInput();
  }

  isActive(command: string): boolean {
    try {
      return document.queryCommandState(command);
    } catch {
      return false;
    }
  }

  onInput(): void {
    const html = this.editorContent.nativeElement.innerHTML;
    this.contentChange.emit(html);
  }

  onKeydown(e: KeyboardEvent): void {
    if (e.key === 'Tab') {
      e.preventDefault();
      document.execCommand('insertHTML', false, '&nbsp;&nbsp;&nbsp;&nbsp;');
    }
  }

  getContent(): string {
    return this.editorContent.nativeElement.innerHTML;
  }

  clearContent(): void {
    this.editorContent.nativeElement.innerHTML = '';
    this.contentChange.emit('');
  }
}
