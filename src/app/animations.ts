import { animation, style, animate, trigger, transition, useAnimation } from '@angular/animations';

export const inSnapOut = trigger('inSnapOut', [
  transition(':enter', [
    style({ opacity: 0}),
    animate(
      '1s linear',
      style({ opacity: 1})
    )
  ]),
  transition(':leave', [
    animate('0s',
      style({ opacity: 0})
    )
  ])
])

export const inOut = trigger('inOut', [
  transition(':enter', [
    style({ opacity: 0}),
    animate(
      '1s ease-in',
      style({ opacity: 1})
    )
  ]),
  transition(':leave', [
    animate('0.5s ease-in',
      style({ opacity: 0})
    )
  ])
])
