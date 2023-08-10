import {ArrayRelatedRP} from "../declarations/rbac/rbac.did";
import {Principal} from "@dfinity/principal";
import {types} from "sass";
import String = types.String;

export const arrRRPConvertor = (arrp: ArrayRelatedRP | undefined) => {
    var s = '';
    // var arr : [RelatedRP] = [{permissions : [], role : ''}];
    if(arrp?.length != 0){
        arrp?.forEach(rp => {
                let role = rp.role;
                let permissions = rp.permissions;
                s += role + ' ' + '{' + ' '
                permissions.forEach(permission=>{
                    s += permission.toString()+ ' ' + ' '
                });
                s +=  ' ' + '};'
        })
    }
    return s;
}

export const arrToStr = (arr: bigint[]) => {
    var s = '';
    if(arr.length != 0){
        arr.forEach(i=>{
                s += i.toString()+ ';' + ' '
            }
        )
    }
    return s;
}

export const arrPrToStr = (arr: Principal[]) => {
    var arr2 = Array<string>() ;
    if(arr.length != 0){
        arr.forEach(i=>{
            arr2.push(i.toString())
            }
        )
    }
    return arr2;
}