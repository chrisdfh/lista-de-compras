import { Component, Inject, OnInit } from '@angular/core';
import {
  MatDialog,
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
} from '@angular/material/dialog';

import { articulo } from '../app.component';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, FormControl, FormGroup, FormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-dialogo',
  standalone: true,
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatDialogClose,
    MatInputModule,
    MatIconModule
  ],
  templateUrl: './dialogo.component.html',
  styleUrl: './dialogo.component.css',
})


export class DialogoComponent implements OnInit{

  articuloEditar: FormGroup

  constructor(
    private fb: FormBuilder,
    protected dialogRef: MatDialogRef<articulo>,
    @Inject(MAT_DIALOG_DATA) public data: articulo,
  ){
    this.articuloEditar = this.fb.group({
      nombre: new FormControl(this.data.nombre,Validators.required),
      precio: new FormControl(this.data.precio,Validators.required)
    })
  }


  ngOnInit(): void {
      console.log('editando')
  }

  regresaData():void{
    if (this.articuloEditar.status != "VALID"){
      this.articuloEditar.markAllAsTouched()
      return
    }
    this.dialogRef.close({
      nombre: this.articuloEditar.value.nombre,
      precio: this.articuloEditar.value.precio
    })
  }

}
