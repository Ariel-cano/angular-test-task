import { Component, OnInit, OnDestroy } from '@angular/core';
import { PackageService, Package } from './services/package.service';
import {  Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PackageCardComponent } from './components/package-card/package-card.component';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, PackageCardComponent, NgOptimizedImage]
})
export class AppComponent implements OnInit, OnDestroy {
  packages: Package[] = [];
  filteredPackages: Package[] = [];
  dependencies: { [key: string]: string[] } = {};
  searchTerm = '';
  private searchTerms = new Subject<string>();
  highlightedPackageId: string | null = null;
  private subscriptions: Subscription[] = [];

  constructor(private packageService: PackageService) {}

  ngOnInit() {
    this.loadPackages();

    const searchSubscription = this.searchTerms.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        this.searchTerm = term;
        return this.packageService.getPackages();
      })
    ).subscribe({
      next: packages => {
        this.packages = packages;
        this.filterPackages();
      },
      error: error => {
        console.error('Ошибка при поиске пакетов:', error);
      }
    });

    this.subscriptions.push(searchSubscription);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadPackages() {
    const loadSubscription = this.packageService.getPackages().subscribe({
      next: packages => {
        this.packages = packages;
        this.filterPackages();
      },
      error: error => {
        console.error('Ошибка при загрузке пакетов:', error);
      }
    });

    this.subscriptions.push(loadSubscription);
  }

  filterPackages() {
    if (!this.searchTerm) {
      this.filteredPackages = this.packages;
    } else {
      this.filteredPackages = this.packages.filter(pkg =>
        pkg.id.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
  }

  onSearch(term: string) {
    this.searchTerms.next(term);
  }

  onPackageHover(packageId: string | null) {
    this.highlightedPackageId = packageId;
    if (packageId) {
      this.loadDependencies(packageId);
    }
  }

  private loadDependencies(packageId: string) {
    if (!this.dependencies[packageId]) {
      const depsSubscription = this.packageService.getDependencies(packageId).subscribe({
        next: deps => {
          this.dependencies[packageId] = deps;
        },
        error: error => {
          console.error('Ошибка при загрузке зависимостей:', error);
        }
      });

      this.subscriptions.push(depsSubscription);
    }
  }

  isDependency(packageId: string): boolean {
    if (!this.highlightedPackageId) return false;
    return this.dependencies[this.highlightedPackageId]?.includes(packageId) || false;
  }
}
