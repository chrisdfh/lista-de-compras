import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { RouterOutlet } from '@angular/router';

import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog'
import { DialogoComponent } from './dialogo/dialogo.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    CommonModule,
    MatIconModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})

export class AppComponent implements OnInit {
  lista: FormGroup;
  @ViewChild('itemNombre') itemNombre!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private dialogo: MatDialog) {
    this.lista = this.fb.group({
      listaNombre: new FormControl('Lista', Validators.required),
      simboloMoneda: new FormControl('$'),
      montoInicial: new FormControl<number>(0),
      resto: new FormControl<number>(0),
      suma: new FormControl<number>(0),
      articulos: new FormArray([]),
      nombre: new FormControl('', Validators.required),
      precio: new FormControl<number | null>(null, Validators.required),
    });
  }

  ngOnInit(): void {
    this.getLocalStorage();


    for (let [key, value] of Object.entries(localStorage)) {
      console.log('voy => ')
      console.log(key)
      console.log(JSON.parse(value))
    }

    const xx = this.getKeys()
    console.log(xx)

  }

  getKeys(){
    Object.keys(localStorage)
        .reduce((obj, k) => {
            return { ...obj, [k]: localStorage.getItem(k)}}, {});
        }


  get articulos(): FormArray {
    return this.lista.controls['articulos'] as FormArray;
  }

  addArticulo(art: articulo | null | undefined): void {
    if (art == null || art == undefined) {
      this.articulos.push(
        new FormGroup({
          nombre: new FormControl(''),
          precio: new FormControl<number | null>(null),
        })
      );
    } else {
      this.articulos.push(
        new FormGroup({
          nombre: new FormControl(art.nombre),
          precio: new FormControl(art.precio),
        })
      );
    }
  }

  deleteArticulo(i: number): void {
    this.articulos.removeAt(i);
    this.updateRestante();
  }

  async updateRestante() {
    let resto;
    let suma = await this.sumaMontos();
    if (
      this.lista.value.montoInicial != '' ||
      this.lista.value.montoInicial != 0
    ) {
      resto = this.lista.value.montoInicial - suma;
    } else {
      resto = 0;
    }

    this.lista.patchValue({
      resto,
      suma,
    });
    this.itemNombre.nativeElement.focus();
  }

  async sumaMontos(): Promise<number> {
    let suma = 0;
    for await (let articulo of this.articulos.controls) {
      suma += articulo.value.precio;
    }
    return suma;
  }

  agregaArticulo(): void {

    if (this.lista.status != "VALID"){
      this.lista.markAllAsTouched()
      return
    }

    const art: articulo = {
      nombre: this.lista.value.nombre,
      precio: this.lista.value.precio,
    };

    this.addArticulo(art);
    this.lista.patchValue({
      nombre: '',
      precio: '',
    });
    this.updateRestante();
  }

  saveLocalStorage(storageName?: string | null | undefined) {
    storageName = storageName || 'ListaCompras';

    window.localStorage.setItem(
      storageName,
      JSON.stringify(this.lista.getRawValue())
    );
  }

  getLocalStorage(storageName?: string | null | undefined) {
    storageName = storageName || 'ListaCompras';

    const listaCompras = window.localStorage.getItem(storageName);
    if (listaCompras != null) {
      const dataLocal = JSON.parse(listaCompras);
      this.loadLocalStorage(dataLocal);
    }
  }

  limpiar() {
    this.lista.reset();
    this.articulos.clear();
  }

  loadLocalStorage(data: Lista) {
    this.lista.reset();
    this.articulos.clear();

    this.lista.patchValue(data);

    data.articulos.forEach((data) => {
      this.addArticulo(data);
    });
  }

  edita(i:number){
    this.dialogo.open(DialogoComponent,{data:this.articulos.at(i).getRawValue() ,maxWidth: '450px', width: '95%', maxHeight: '200px', height: '90%'}).afterClosed().subscribe(
      articuloEditado=>{
        if(articuloEditado){
          console.log(articuloEditado)
          this.articulos.at(i).patchValue(articuloEditado)
          this.updateRestante()
        }
      }
    )
  }
}

export interface articulo {
  nombre: string;
  precio: number;
}

interface Lista {
  listaNombre: string;
  simboloMoneda: string;
  montoInicial: number;
  resto: number;
  suma: number;
  nombre: string;
  precio: number;
  articulos: articulo[];
}

