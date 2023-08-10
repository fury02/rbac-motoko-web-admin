import Text "mo:base/Text";
import Time "mo:base/Time";
import Types "../types/types";
import Principal "mo:base/Principal";

import Settings "../eternal/settings";
import Fuzz "mo:fuzz";

module{
    type Alg = Types.Alg;
    type TypeToken = Types.TypeToken;
    type Token = Types.Token;
    type Header = Types.Header;
    type Payload  = Types.Payload;
    type ListRelatedRP = Types.ListRelatedRP;
    type ArrayRelatedRP = Types.ArrayRelatedRP;
    public class JWT() = self {
        private let alg : Alg =  #NONE;
        private let typ_unsign : TypeToken =  #UJWT;
        private let typ : TypeToken =  #JWT;
        private let header: Header = {
            typ = typ_unsign;
            alg = alg
        };
        let fuzz = Fuzz.Fuzz();
        private func token_tid() : Text {  fuzz.text.randomAlphanumeric(Settings.length_bytes); };  
        private func default_header() : Header { header; };
        private func payload(
            exp: Time.Time, 
            principal: Principal, 
            arp : ArrayRelatedRP) : Payload { 
            {
                nbf= "";
                iat= "";
                iss = "";  
                sub = "";   
                aud = "";  
                jti = token_tid();
                exp = exp; //time  
                principal= principal;
                lrp = null; 
                arp = arp;
            };
        };
        public func unsigned_token(
            exp: Time.Time, 
            principal: Principal, 
            arp : ArrayRelatedRP) : Token { 
            {
                header = default_header(); 
                payload = payload(exp, principal, arp);
            };
        };
    };          
}