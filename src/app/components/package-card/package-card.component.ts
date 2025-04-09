import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Package } from '../../services/package.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-package-card',
  templateUrl: './package-card.component.html',
  styleUrls: ['./package-card.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class PackageCardComponent {
  @Input() package!: Package;
  @Input() isHighlighted: boolean = false;
  @Input() isDependency: boolean = false;
  @Output() hover = new EventEmitter<string | null>();

  onMouseEnter() {
    this.hover.emit(this.package.id);
  }

  onMouseLeave() {
    this.hover.emit(null);
  }

  formatNumber(num: number): string {
    if (num >= 1000000) {
      return `${Math.floor(num / 1000000)}M`;
    }
    if (num >= 1000) {
      return `${Math.floor(num / 1000)}K`;
    }
    return num.toString();
  }

  getPackageNameParts(): { prefix: string, name: string } {
    const parts = this.package.id.split('/');
    if (parts.length > 1) {
      return { prefix: parts[0], name: parts[1] };
    }
    return { prefix: '', name: this.package.id };
  }
} 