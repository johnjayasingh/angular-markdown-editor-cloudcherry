import { Directive } from '@angular/core';
import {
  ElementRef, HostListener, Input,
  Output, EventEmitter, Renderer2, Inject, AfterViewInit
} from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';

@Directive({
  selector: '[ccMarkdown]'
})

export class MarkdownDirective implements AfterViewInit {

  constructor(private _el: ElementRef, private _renderer: Renderer2, @Inject(DOCUMENT) private document) { }

  @Input('ccMarkdown') inputValue: string;
  @Output('valueChange') valueChange: EventEmitter<any> = new EventEmitter();
  selectedText: any;
  _onValueChange() {
    this.valueChange.emit({
      markDown: this,
      html: ''
    })
  }

  ngAfterViewInit() {
    let parent = this._el.nativeElement.parentNode;
    let self = this;
    document.addEventListener("selectionchange", function () {
      self.selectedText = window.getSelection().toString();
    });
    let _self = this;
    const template = `
    <div>
      <div class="markdown-container">
          <div class="textarea-container">
              <textarea class="markdown-textarea">${this.inputValue}</textarea>
          </div>
          <div class="preview-container">
          
          </div>
          <div class="controls-container">
              <div class="controls">
                  <input type="button" id="boldSelection" class"bold-span" value="B"/>
                  <input type="button" id="italicSelection" class"italic-span" value="I"/>
                  <input type="button" id="linkSelection" class"link-span" value="H"/>
              </div>
          </div>
      </div>
    </div> 
    `;

    if (this._el.nativeElement.type === 'textarea') {
      this._el.nativeElement.outerHTML = template;
    } else {
      this._el.nativeElement.innerHTML = template;
    }
    this.mardown();

    this._renderer.listen('document', 'click', (event) => {
      switch (event.target.id) {
        case 'boldSelection':
          this.replaceSelectedText('BOLD')
          break;
        case 'italicSelection':
          this.replaceSelectedText('ITALIC')
          break;
        case 'linkSelection':
          this.replaceSelectedText('URL')
          break;
        default:
          break;
      }
    });

    this._renderer.listen('document', 'keyup', (event) => {
      if (event.target.className === 'markdown-textarea') {
        this.replaceValues(event.target.value);
      }
    });
  }

  replaceSelectedText(replacementType) {
    let textarea = this._el.nativeElement.querySelector('.markdown-textarea');
    this.inputValue = this.inputValue.replace(this.selectedText,
      replacementType === 'BOLD' ? `**${this.selectedText}**` : replacementType === 'ITALIC' ? `//${this.selectedText}//` : `[[${this.selectedText}|${this.selectedText}]]`
    )
    textarea.value = this.inputValue;
    this.mardown();
  }

  replaceValues(value) {
    this.inputValue = value;
    this.mardown();
  }

  mardown() {
    let preview = this._el.nativeElement.querySelector('.preview-container');
    let html = this.inputValue;
    html = html.replace(/[*][*](.+?)[*][*]/g, "<b>$1</b>");
    html = html.replace(/[/][/](.+?)[/][/]/g, "<i>$1</i>");
    html = html.replace(/[[][[](.+?)[|](.+?)]{2}/g, "<a target='_blank' href='$1'>$2</a>");
    //
    preview.innerHTML = html;
    this.valueChange.emit({
      markDown: this.inputValue,
      html: preview.innerHTML
    });
  }

}