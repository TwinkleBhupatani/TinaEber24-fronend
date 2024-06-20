import { Injectable } from '@angular/core';

export interface NavigationItem {
  id: string;
  title: string;
  type: 'item' | 'collapse' | 'group';
  icon?: string;
  url?: string;
  classes?: string;
  external?: boolean;
  target?: boolean;
  children?: Navigation[];
}

export interface Navigation extends NavigationItem {
  children?: NavigationItem[];
}
const NavigationItems = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'default',
        title: 'Default',
        type: 'item',
        classes: 'nav-item',
        url: '/default',
        icon: 'ti ti-dashboard'
      }
    ]
  },
  {
    id: 'ride',
    title:"Rides",
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'ride',
        title: 'Rides',
        type: 'collapse',
        icon: 'ti ti-car',
        children: [
          {
            id: 'create-ride',
            title: 'Create Ride',
            type: 'item',
            url: '/rides/create-ride',
          },
          {
            id: 'confirmed-rides',
            title: 'Confirmed Rides',
            type: 'item',
            url: '/rides/confirmed-rides',
          },
          {
            id: 'ride-history ',
            title: 'Ride History',
            type: 'item',
            url: '/rides/ride-history',
            
          }
        ]
      }
    ]
  },
  {
    id: 'users',
    title: 'Users',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'users',
        title: 'Users',
        type: 'item',
        classes: 'nav-item',
        url: '/users',
        icon: 'ti ti-user'
      },
    ]
  },
  {
    id: 'drivers',
    title:"Drivers",
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'drivers',
        title: 'Drivers',
        type: 'collapse',
        icon: 'ti ti-user ',
        children: [
          {
            id: 'list',
            title: 'List ',
            type: 'item',
            url: '/drivers/list',
            
          },
          {
            id: 'running-request',
            title: 'Running Request',
            type: 'item',
            url: '/drivers/running-request',
          },

        ]
      }
    ]
  },
  {
    id: 'pricing',
    title:"Pricing",
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'pricing',
        title: 'Pricing',
        type: 'collapse',
        icon: 'ti ti-coin',
        children: [
          {
            id: 'country',
            title: 'Country ',
            type: 'item',
            url: '/pricing/country',
          },
          {
            id: 'city',
            title: 'City',
            type: 'item',
            url: '/pricing/city',
          },
          {
            id: 'vehicle-type ',
            title: 'Vehicle Type',
            type: 'item',
            url: '/pricing/vehicle-type',
          },
          {
            id: 'vehicle-pricing ',
            title: 'Vehicle Pricing',
            type: 'item',
            url: '/pricing/vehicle-pricing',
          }
        ]
      }
    ]
  },
  {
    id: 'settings',
    title: 'Settings',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'users',
        title: 'Settings',
        type: 'item',
        classes: 'nav-item',
        url: '/settings',
        icon: 'ti ti-settings'
      },
    ]
  },
];

@Injectable()
export class NavigationItem {
  get() {
    return NavigationItems;
  }
}
