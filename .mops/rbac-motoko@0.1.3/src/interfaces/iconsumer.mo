import Types "../types/types";
import Text "mo:base/Text";
import Principal "mo:base/Principal";
import Bool "mo:base/Bool";

module {
    type AuthClient = Types.AuthClient;
    public type IConsumer = actor { 
        client : () -> async ?AuthClient;
    };
};
