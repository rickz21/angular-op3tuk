import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { fromEvent, BehaviorSubject } from 'rxjs';
import { switchMap, takeUntil, pairwise } from 'rxjs/operators'

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  @ViewChild('canvas') public canvas: ElementRef;
  color = 'black';
  context: CanvasRenderingContext2D;
  canvasEl: HTMLCanvasElement;
  rect: DOMRect | ClientRect;
  dataURL = new BehaviorSubject("");

  public ngOnInit() {
    this.canvasEl = this.canvas.nativeElement;
    this.context = this.canvasEl.getContext('2d');
    this.canvasEl.width = 200;
    this.canvasEl.height = 100;
    this.context.fillStyle = "white";
    this.context.fillRect(0, 0, this.canvasEl.width, this.canvasEl.height);
    this.rect = this.canvasEl.getBoundingClientRect();
    this.context.lineWidth = 2;
    this.context.lineCap = 'round';
    this.context.strokeStyle = this.color;
    this.dataURL.next(this.canvasEl.toDataURL());
    this.captureEvents(this.canvasEl);
  }
  private captureEvents(canvasEl: HTMLCanvasElement) {
    fromEvent(canvasEl, 'mousedown')
      .pipe(
        switchMap((e) => {
          return fromEvent(canvasEl, 'mousemove')
            .pipe(
              takeUntil(fromEvent(canvasEl, 'mouseup')),
              takeUntil(fromEvent(canvasEl, 'mouseleave')),
              pairwise()
            )
        })
      ).subscribe((res: [MouseEvent, MouseEvent]) => {
        const prevPos = {
          x: res[0].clientX - this.rect.left,
          y: res[0].clientY - this.rect.top 
        };
        const currentPos = {
          x: res[1].clientX - this.rect.left,
          y: res[1].clientY - this.rect.top 
        };
        this.drawOnCanvas(prevPos, currentPos);
      });
    fromEvent(canvasEl, 'touchstart')
      .pipe(
        switchMap((e) => {
          return fromEvent(canvasEl, 'touchmove')
            .pipe(
              takeUntil(fromEvent(canvasEl, 'touchend')),
              takeUntil(fromEvent(canvasEl, 'touchleave')),
              pairwise()
            )
        })
      ).subscribe((res: [TouchEvent, TouchEvent]) => {
        const prevPos = {
          x: res[0].touches[0].clientX - this.rect.left,
          y: res[0].touches[0].clientY - this.rect.top
        };
        const currentPos = {
          x: res[1].touches[0].clientX - this.rect.left,
          y: res[1].touches[0].clientY - this.rect.top
        };
        this.drawOnCanvas(prevPos, currentPos);
      });
  }
  private drawOnCanvas(prevPos: { x: number, y: number }, currentPos: { x: number, y: number }) {
    if (!this.context) { return; }
    this.context.strokeStyle = this.color;
    this.context.beginPath();
    if (prevPos) {
      this.context.moveTo(prevPos.x, prevPos.y);
      this.context.lineTo(currentPos.x, currentPos.y);
      this.context.stroke();
    }
    this.dataURL.next(this.canvasEl.toDataURL());
  }
  setLineWidth(w) {
    this.context.lineWidth = w;
  }
  clear() {
    this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
    if (this.color === 'white') {
      this.color = 'black';
    }
    this.dataURL.next(this.canvasEl.toDataURL());
  }
  prevent(e) {
    e.preventDefault();
    return false;
  }
}

