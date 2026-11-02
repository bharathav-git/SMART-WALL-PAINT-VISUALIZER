import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <footer class="app-footer">
      <div class="footer-container">
        <div class="footer-grid">
          <div class="footer-col brand-col">
            <div class="footer-logo">
              <span class="logo-mark">🎨</span>
              <span class="logo-title">Smart Wall Paint Visualizer</span>
            </div>
            <p class="brand-desc">
              Transform your living spaces with precision wall segmentation, realistic luminance-preserving paint simulation, and architectural finish overlays.
            </p>
          </div>

          <div class="footer-col">
            <h4>Application</h4>
            <ul>
              <li><a routerLink="/">Home Overview</a></li>
              <li><a routerLink="/studio">Interactive Studio</a></li>
              <li><a routerLink="/dashboard">Project Dashboard</a></li>
              <li><a routerLink="/saved-designs">Design Gallery</a></li>
            </ul>
          </div>

          <div class="footer-col">
            <h4>Technology</h4>
            <ul>
              <li><span>MEAN Stack Architecture</span></li>
              <li><span>HTML5 Canvas Pixel Engine</span></li>
              <li><span>Luminance Modulation Blend</span></li>
              <li><span>Role-Based Access Control</span></li>
            </ul>
          </div>

          <div class="footer-col">
            <h4>Architectural Notice</h4>
            <p class="disclaimer-text">
              Color rendering provides an approximate digital representation. Perceived color may vary depending on screen calibration, room lighting, substrate porosity, and actual paint manufacturer sheen.
            </p>
          </div>
        </div>

        <div class="footer-bottom">
          <p>© 2026 Smart Wall Paint Visualizer. Designed for modern interior design and architectural visualization.</p>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .app-footer {
      background: #111827;
      color: #9ca3af;
      padding: 4rem 1.5rem 2rem;
      border-top: 1px solid #1f2937;
      margin-top: auto;
    }
    .footer-container {
      max-width: 1400px;
      margin: 0 auto;
    }
    .footer-grid {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1.5fr;
      gap: 3rem;
      margin-bottom: 3rem;
    }
    .brand-col .footer-logo {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #ffffff;
      font-weight: 700;
      font-size: 1.15rem;
      margin-bottom: 1rem;
    }
    .brand-desc, .disclaimer-text {
      font-size: 0.88rem;
      line-height: 1.6;
      color: #94a3b8;
    }
    .footer-col h4 {
      color: #f1f5f9;
      font-size: 0.95rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 1.25rem;
    }
    .footer-col ul {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
    }
    .footer-col ul a, .footer-col ul span {
      color: #94a3b8;
      font-size: 0.88rem;
      text-decoration: none;
      transition: color 0.2s;
    }
    .footer-col ul a:hover {
      color: #38bdf8;
    }
    .footer-bottom {
      border-top: 1px solid #1f2937;
      padding-top: 1.5rem;
      text-align: center;
      font-size: 0.82rem;
      color: #64748b;
    }
    @media (max-width: 900px) {
      .footer-grid {
        grid-template-columns: 1fr;
        gap: 2rem;
      }
    }
  `]
})
export class FooterComponent {}
