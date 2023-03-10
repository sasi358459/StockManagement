import { AfterViewInit, Component, Inject } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { MatDialog, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { ToastrService } from "ngx-toastr";
import { LoginPanelService } from "../../login-panel/login-panel.service";
import { ProductService } from "../product.service";

@Component({
  selector : 'app-product-display-modal',
  templateUrl : 'product-display.modal.component.html',
  styleUrls : ['product-display.modal.component.css']
})

export class ProductDisplayModal implements AfterViewInit {
  productsAdd!:FormGroup
  Editproducts:boolean
  constructor(private _productService:ProductService,
    private _toaster:ToastrService,
    private loginService:LoginPanelService,
    @Inject(MAT_DIALOG_DATA) public data:any){
    this.productsAdd = new FormGroup({
      productName : new FormControl('',Validators.required),
      sellingPrice : new FormControl('',Validators.required),
      receivedPrice : new FormControl('',Validators.required),
      quantity : new FormControl('',Validators.required),
    })
    this.Editproducts = false
  }

  get productName(){
    return this.productsAdd.get('productName')
  }
  get sellingPrice(){
    return this.productsAdd.get('sellingPrice')
  }
  get receivedPrice(){
    return this.productsAdd.get('receivedPrice')
  }
  get quantity(){
    return this.productsAdd.get('quantity')
  }

  ngAfterViewInit(): void {
    this.data?this.Editproducts=true:this.Editproducts=false;
    if(this.Editproducts){
      this.productsAdd.patchValue(this.data.products);
    }
  }

  productsSubmit(){
    const user = this.loginService.getLocalStorage('user')
    if(this.Editproducts){
      this._productService.updateProduct(user.productsId,this.data.productItemIndex,this.productsAdd.value).subscribe((value:any)=>{
        if(!value.error){
          this._toaster.success(value.message);
          this._productService.emitSubject(true);
        }else{
          this._toaster.error(value.message)
        }
      },(rej)=>{
        if(rej){
          this._toaster.error(rej.error.message)
        }
      })
    }else{
      this._productService.getProducts(user.productsId).subscribe((value:any) => {
        if(!value.error){
          value.body.products.push(this.productsAdd.value)
          this._productService.addProducts(value.body.products,user).subscribe((value:any) =>{
              if(value.error){
                  this._toaster.error(value.message)
                }else{
                  this._toaster.success(value.message)
                }
              },(rej)=>{
                this._toaster.error(rej.error.message)
              })
        }
      },(rej)=>{
        if(rej){
          this._toaster.error(rej.error.message)
        }
      })
    }
  }
}
