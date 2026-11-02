import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ColorService } from '../../core/services/color.service';
import { AuthService } from '../../core/services/auth.service';
import { Color } from '../../core/models';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {
  featuredColors: Color[] = [];
  selectedSampleRoom: string = '/assets/sample-rooms/modern_living_room.svg';
  activeColorHex: string = '#2A7B88';
  activeColorName: string = 'Aegean Teal';

  sampleRooms = [
    {
      name: 'Architectural Living Room',
      path: '/assets/sample-rooms/modern_living_room.svg',
      desc: 'Double-height walls with expansive daylight'
    },
    {
      name: 'Master Suite Bedroom',
      path: '/assets/sample-rooms/master_bedroom.svg',
      desc: 'Accent headboard feature wall with bedside lighting'
    },
    {
      name: 'Scandinavian Dining Room',
      path: '/assets/sample-rooms/minimalist_dining.svg',
      desc: 'Minimalist dining room with round focal mirror'
    }
  ];

  constructor(
    public authService: AuthService,
    private colorService: ColorService
  ) {}

  ngOnInit(): void {
    this.colorService.getColors().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.featuredColors = res.data.slice(0, 8);
        }
      },
      error: () => {
        // Fallback colors if offline
        this.featuredColors = [
          { _id: '1', name: 'Aegean Teal', hex: '#2A7B88', category: 'Cool', manufacturer: 'Smart Palette', finishOptions: ['matte'], isActive: true },
          { _id: '2', name: 'Sage Sanctuary', hex: '#9CAF88', category: 'Earthy', manufacturer: 'Smart Palette', finishOptions: ['matte'], isActive: true },
          { _id: '3', name: 'Terracotta Hearth', hex: '#C86D51', category: 'Warm', manufacturer: 'Smart Palette', finishOptions: ['matte'], isActive: true },
          { _id: '4', name: 'Alabaster Whisper', hex: '#F4F1EA', category: 'Neutral', manufacturer: 'Smart Palette', finishOptions: ['matte'], isActive: true },
          { _id: '5', name: 'Midnight Navy', hex: '#1B263B', category: 'Cool', manufacturer: 'Smart Palette', finishOptions: ['matte'], isActive: true },
          { _id: '6', name: 'Golden Ochre', hex: '#D4AF37', category: 'Warm', manufacturer: 'Smart Palette', finishOptions: ['matte'], isActive: true },
          { _id: '7', name: 'Charcoal Velour', hex: '#2B2D42', category: 'Dark & Moody', manufacturer: 'Smart Palette', finishOptions: ['matte'], isActive: true },
          { _id: '8', name: 'Lavender Mist', hex: '#C5B4E3', category: 'Pastel', manufacturer: 'Smart Palette', finishOptions: ['matte'], isActive: true }
        ];
      }
    });
  }

  selectColor(color: Color): void {
    this.activeColorHex = color.hex;
    this.activeColorName = color.name;
  }

  selectRoom(roomPath: string): void {
    this.selectedSampleRoom = roomPath;
  }
}
