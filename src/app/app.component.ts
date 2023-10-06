import { Component } from '@angular/core';


import { Router, NavigationEnd  } from '@angular/router';
import { Location } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'ma-backoffice';
  showBackButton: boolean = false;
  currentPageName: string = 'Parcours de soins';
  isSidebarPresent: boolean = false; 

  constructor(private router: Router, private location: Location) {
    // Écoutez les événements de navigation qui sont de type NavigationEnd
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.showBackButton = this.router.url !== '/table';
      this.updatePageName();
      this.updateSidebarPresence();
    });
  }

  updatePageName() {
    if (this.router.url.startsWith('/patient/')) {
      this.currentPageName = 'Détails du patient';
    } else {
      switch (this.router.url) {
        case '/table':
          this.currentPageName = 'Parcours de soins';
          break;
        // Ajoutez d'autres cas au besoin
        default:
          this.currentPageName = 'Inconnu';  // ou n'importe quelle autre valeur par défaut
      }
    }
  }

  updateSidebarPresence() {
    // Exemple : activer la sidebar pour une route spécifique
    if (this.router.url.startsWith('/patient/')) {
        this.isSidebarPresent = true;
    } else {
        this.isSidebarPresent = false;
    }
}

  goBack() {
    this.location.back();
  }
}
