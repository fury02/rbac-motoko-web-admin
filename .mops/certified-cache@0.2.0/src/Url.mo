import Http "Http";
import TrieMap "mo:base/TrieMap";
module {
      public class Headers(headers: Headers) {
        public let original = headers;
        let mvMap = MultiValueMap.MultiValueMap<Text, Text>(Text.equal, Text.hash);

        for ((_key, value) in headers.vals()) {
            let key  = Utils.toLowercase(_key);
        
            // split and trim comma seperated values 
            let valuesIter = Iter.map<Text, Text>(
                Text.split(value, #char ','), 
                func (text){
                    Text.trim(text, #char ' ')
                });
                
            let values = Iter.toArray(valuesIter);
            mvMap.addMany(key, values);
        };

        public let trieMap: TrieMap.TrieMap<Text, [Text]> = mvMap.freezeValues();

        public func get(_key: Text): ?[Text]{
            let key =  Utils.toLowercase(_key);
            return trieMap.get(key);
        };

        public let keys = Iter.toArray(trieMap.keys());
    };
  public class URL (url: Text, headers: Headers){
        
        var url_str = (Option.get(headers.get("host"), [""]))[0];  

        public let original = url_str # url;

        public let protocol = "https"; 

        let authority = Iter.toArray(Text.tokens(url_str, #char(':')));
        let (_host, _port): (Text, Nat16) = switch (authority.size()){
            case (0) ("", defaultPort(protocol));
            case (1) (authority[0], defaultPort(protocol));
            case (_) (authority[0], Nat16.fromNat(Utils.textToNat(authority[1])));
        };

        public let port = _port;

        public let host = object {
            public let original = _host;
            public let array = Iter.toArray(Text.tokens(_host, #char('.')));
        }; 

        url_str:= url;

        let p =  Iter.toArray(Text.tokens(url_str, #char('#')));

        public let anchor = if (p.size() > 1){
            url_str := p[0];
            p[1]
        }else {
            url_str := p[0];
            ""
        };
        
        let re = Iter.toArray(Text.tokens(url_str, #char('?')));

        let queryString: Text = switch (re.size()){
            case (0) {
                url_str := "";
                re[1] 
            };
            case (1){
                url_str := re[0];
                ""
            };

            case (_){
                url_str := re[0];
                re[1]
            };
            
        };

        public let queryObj: SearchParams = SearchParams(queryString);

        let path_iter = Text.tokens(url_str, #char('/')); 

        public let path = object {
            public let array = Iter.toArray(path_iter);
            public let original = "/" # Text.join("/", Iter.fromArray(array));
        };

    };
}
