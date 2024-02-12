import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { RouterOutlet } from '@angular/router';

import { MatInputModule } from '@angular/material/input'
import { MatFormFieldModule } from '@angular/material/form-field';
import {MatCardModule} from '@angular/material/card'; 
import { ReactiveFormsModule } from '@angular/forms';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,MatInputModule,MatFormFieldModule,ReactiveFormsModule,MatButtonModule,MatCardModule,CommonModule,MatIconModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})


export class AppComponent implements OnInit{
  lista: FormGroup;
  @ViewChild('itemNombre') itemNombre!:ElementRef

  constructor(private fb: FormBuilder) {
    this.lista = this.fb.group({
      listaNombre: new FormControl('Lista', Validators.required),
      simboloMoneda: new FormControl('$'),
      montoInicial: new FormControl<number>(0),
      resto: new FormControl<number>(0),
      suma: new FormControl<number>(0),
      articulos: new FormArray([]),
      nombre:new FormControl(''),
      precio: new FormControl<number|null>(null)
    });
  }

  ngOnInit(): void {
    this.getLocalStorage()
  }

  get articulos():FormArray{
    return this.lista.controls['articulos'] as FormArray
  }

  addArticulo(art:articulo|null|undefined):void {
    if(art == null || art == undefined){
      this.articulos.push(new FormGroup({
        nombre: new FormControl(''),
        precio: new FormControl<number|null>(null)
      }))
    }else {
      this.articulos.push(new FormGroup({
        nombre: new FormControl(art.nombre),
        precio: new FormControl(art.precio)
      }))
    }
  }

  deleteArticulo(i:number):void{
    this.articulos.removeAt(i)
    this.updateRestante()
  }

  async updateRestante(){

    let resto
    let suma = await this.sumaMontos()
    if (this.lista.value.montoInicial != '' ||this.lista.value.montoInicial != 0){
      resto = this.lista.value.montoInicial - suma
    } else {
      resto = 0
    }

    this.lista.patchValue({
      resto,
      suma
    })
    this.itemNombre.nativeElement.focus()
  }

  async sumaMontos():Promise<number>{
    let suma=0
    for await (let articulo of this.articulos.controls){
      console.log(articulo.value.precio)
      suma += articulo.value.precio
    }
    return suma
  }

  agregaArticulo():void {
    const art:articulo = {
      nombre:this.lista.value.nombre,
      precio: this.lista.value.precio
    }

    this.addArticulo(art)
    this.lista.patchValue({
      nombre:'',
      precio:''
    })
    this.updateRestante()
  }

  saveLocalStorage(){
    window.localStorage.setItem('ListaCompras',JSON.stringify(this.lista.getRawValue()))
  }

  getLocalStorage(storageName?:string|null|undefined){
    storageName = storageName||'ListaCompras'

    const listaCompras = window.localStorage.getItem(storageName)
    if(listaCompras != null){
      const dataLocal = JSON.parse(listaCompras)
      this.loadLocalStorage(dataLocal)
    }
  }

  limpiar(){
    this.lista.reset()
    this.articulos.clear()
  }

  loadLocalStorage(data:Lista){
    this.lista.reset()
    this.articulos.clear()

    this.lista.patchValue(
      data
    )

    data.articulos.forEach(data=>{
      this.addArticulo(data)
    })


  }

}

interface articulo {
  nombre: string,
  precio: number
}

interface Lista {
  listaNombre:string
  simboloMoneda:string
  montoInicial:number
  resto:number
  suma:number
  nombre:string
  precio :number
  articulos:articulo[]
}