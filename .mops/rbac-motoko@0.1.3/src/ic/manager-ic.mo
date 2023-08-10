import Principal "mo:base/Principal";
import Blob "mo:base/Blob";
import Nat "mo:base/Nat";
import Nat64 "mo:base/Nat64";
import Nat16 "mo:base/Nat16";
import Text "mo:base/Text";

import Types "../types/types";

module {
  public type canister_id = Types.canister_id;
  public type canister_settings = Types.canister_settings;
  public type definite_canister_settings = Types.definite_canister_settings;
  public type from_user = Types.from_user ;
  public type from_canister = Types.from_canister ;
  public type change_origin = Types.change_origin;
  public type change_details = Types.change_details ;
  public type change = Types.change;
  public type http_header = Types.http_header;
  public type http_response = Types.http_response;
  public type ecdsa_curve = Types.ecdsa_curve;

  public let Manager = actor "aaaaa-aa" : actor {
    canister_status : ({ canister_id : canister_id }) -> async ({
      status : { #running; #stopping; #stopped };
      // settings : canister_settings;
      settings : definite_canister_settings;
      module_hash : ?Blob;
      memory_size : Nat;
      cycles : Nat;
      freezing_threshold : Nat;
    });
    canister_info : ({
      canister_id : canister_id;
      num_requested_changes : Nat64;
    }) -> async ({
      total_num_changes : Nat64;
      recent_changes : [change];
      module_hash : ?Blob;
      controllers : [Principal];
    });
    update_settings : ({
      canister_id : Principal;
      // settings : canister_settings;
      settings : definite_canister_settings;
      sender_canister_version : ?Nat64;
    }) -> async ();
    http_request : {
      url : Text;
      max_response_bytes : ?Nat64;
      method : { #get; #head; #post };
      headers : [http_header];
      body : ?Blob;
      transform : ?{
        function : shared query ({ response : http_response; context : Blob }) -> async (http_response);
        context : Blob;
      };
    } -> async http_response;
    // Threshold ECDSA signature
    ecdsa_public_key : ({
      canister_id : ?canister_id;
      derivation_path : [Blob];
      key_id : { curve: ecdsa_curve; name: Text };
    }) -> async ({ public_key : Blob; chain_code : Blob; });
    sign_with_ecdsa : ({
      message_hash : Blob;
      derivation_path : [Blob];
      key_id : { curve: ecdsa_curve; name: Text };
    }) -> async ({ signature : Blob });
  };
};