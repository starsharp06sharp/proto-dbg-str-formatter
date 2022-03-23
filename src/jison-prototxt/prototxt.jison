/* description: Parses protobuf message "DebugString". */

/* lexical grammar */
%lex

int  "-"?([0-9]|[1-9][0-9]+)
exp  [eE][-+]?[0-9]+
frac  "."[0-9]+

%%
\s+      /* skip whitespace */

[A-Za-z_][A-za-z_0-9]*   return 'IDENT'
{int}{frac}?{exp}?\b    return 'NUMBER'
\"(?:'\\'[\\"'bfnrt/]|'\\'[0-7]{3}|[^\\\0-\x09\x0a-\x1f"])*\" return 'STRING'

"{"      return '{'
"}"      return '}'
"["      return '['
"]"      return ']'
":"      return ':'
<<EOF>>  return 'EOF'
.        return 'INVALID'

/lex

%start expressions

%% /* language grammar */

expressions
    : pair_list EOF
        {
        console.log($1);
        return $1;
        }
    ;

basic_value:
  NUMBER | STRING | IDENT
  { $$ = $1; }
  ;

key_name:
  IDENT | NUMBER
  { $$ = $1; }
  ;

pair:
  key_name ':' basic_value
  {
    $$ = {
      'key': $1,
      'value': $3,
    };
  }
  |
  key_name object
  {
    $$ = {
      'key': $1,
      'value': $2,
    };
  }
  ;

pair_list:
  pair
  { $$ = [$1]; }
  |
  pair_list pair
  { $$ = $1.concat([$2]); }
  ;

object:
  '{' '}'
  { $$ = []; }
  |
  '{' pair_list '}'
  { $$ = $2; }
  ;
