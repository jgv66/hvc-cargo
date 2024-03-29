import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes =
[
  { path: '',  redirectTo: 'home', pathMatch: 'full'  },
  { path: 'home',        loadChildren: () => import('./pages/home/home.module')                          .then( m => m.HomePageModule         ) },
  { path: 'login',       loadChildren: () => import('./pages/login/login.module')                        .then( m => m.LoginPageModule        ) },
  { path: 'logout',      loadChildren: () => import('./pages/logout/logout.module')                      .then( m => m.LogoutPageModule       ) },
  { path: 'pikear',      loadChildren: () => import('./pages/recibirencomienda/recibirencomienda.module').then( m => m.RecibirencomiendaPageModule) },
  { path: 'ordenpik',    loadChildren: () => import('./pages/ordenpik/ordenpik.module')                  .then( m => m.OrdenpikPageModule     ) },
  { path: 'acopiar',     loadChildren: () => import('./pages/acopiar/acopiar.module')                    .then( m => m.AcopiarPageModule      ) },
  { path: 'entregar',    loadChildren: () => import('./pages/delivery/delivery.module')                  .then( m => m.DeliveryPageModule     ) },
  { path: 'delivery-fin',loadChildren: () => import('./pages/delivery-fin/delivery-fin.module')          .then( m => m.DeliveryFinPageModule  ) },
  { path: 'seguimiento', loadChildren: () => import('./pages/seguimiento/seguimiento.module')            .then( m => m.SeguimientoPageModule  ) },
  { path: 'verfoto',     loadChildren: () => import('./pages/verfoto/verfoto.module')                    .then( m => m.VerfotoPageModule      ) },
  { path: 'rutas',       loadChildren: () => import('./pages/rutas/rutas.module')                        .then( m => m.RutasPageModule        ) },
  { path: 'carrete',     loadChildren: () => import('./pages/verfotos/verfotos.module')                  .then( m => m.VerfotosPageModule     ) },
  { path: 'cambioclave', loadChildren: () => import('./pages/signup/signup.module')                      .then( m => m.SignupPageModule       ) },
  { path: 'meolvide',    loadChildren: () => import('./pages/meolvide/meolvide.module')                  .then( m => m.MeolvidePageModule     ) },
  { path: '**',          redirectTo: 'home', pathMatch: 'full' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}

// { path: 'temas',       loadChildren: () => import('./pages/temas/temas.module')              .then(m => m.TemasPageModule         ) },