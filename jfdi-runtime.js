function is_null(xs) {
	return xs === null;
}

function is_undefined(xs) {
	return typeof xs === "undefined";
}

function is_number(xs) {
	return typeof xs === "number";
}

function is_string(xs) {
	return typeof xs === "string";
}

function is_boolean(xs) {
	return typeof xs === "boolean";
}

function is_object(xs) {
	return typeof xs === "object" || is_function(xs);
}

function is_function(xs) {
	return typeof xs === "function";
}

function is_NaN(x) {
	return is_number(x) && isNaN(x);
}

function has_own_property(obj,p) {
	return obj.hasOwnProperty(p);
}

function is_array(a){
	return a instanceof Array;
}

/**
 * @deprecated Use timed instead.
 * @returns The current time, in milliseconds, from the Unix Epoch.
 */
function runtime() {
	var d = new Date();
	return d.getTime();
}

/**
 * Throws an error from the interpreter, stopping execution.
 *
 * @param {string} message The error message.
 * @param {number=} line The line number where the error occurred. This line number
 *                       will be one less than on file, because the indices used by
 *                       jison start from 0.
 * @returns {null} Should not return. Exception should be thrown otherwise program
 *                 will be in an invalid state.
 */
function error(message, line) {
	throw new SyntaxError(message, null,
		line === undefined ? undefined : line + 1);
}

function newline() {
	display("\n");
}

function random(k){
	return Math.floor(Math.random()*k);
}

function timed(f) {
	var self = this;
	var timerType = window.performance ? performance : Date;
	return function() {
		var start = timerType.now();
		var result = f.apply(self, arguments);
		var diff = (timerType.now() - start);
		console.log('Duration: ' + Math.round(diff) + 'ms');
		return result;
	};
}
function read(x) {
	return prompt(x);
}

function write(x) {
	return alert(x);
}

function apply_in_underlying_javascript(prim,argument_list) {
   var argument_array = list_to_vector(argument_list);

   //Call prim with the same this argument as what we are running under.
   //this is populated with an object reference when we are an object. We
   //are not in this context, so this will usually be the window. Thus
   //passing this as the argument shouls behave. (Notably, passing the
   //function itself as a value of this is bad: if the function that is being
   //called assumes this to be window, we'll clobber the function value instead.
   //Also, alert won't work if we pass prim as the first argument.)
   return prim.apply(this, argument_array);
}
;// list.js: Supporting lists in the Scheme style, using pairs made
//          up of two-element JavaScript array (vector)

// Author: Martin Henz

// array test works differently for Rhino and
// the Firefox environment (especially Web Console)
function array_test(x) {
    if (Array.isArray === undefined) {
        return x instanceof Array;
    } else {
        return Array.isArray(x);
    }
}

// pair constructs a pair using a two-element array
// LOW-LEVEL FUNCTION, NOT JEDISCRIPT
function pair(x, xs) {
    return [x, xs];
}

// is_pair returns true iff arg is a two-element array
// LOW-LEVEL FUNCTION, NOT JEDISCRIPT
function is_pair(x) {
    return array_test(x) && x.length === 2;
}

// head returns the first component of the given pair,
// throws an exception if the argument is not a pair
// LOW-LEVEL FUNCTION, NOT JEDISCRIPT
function head(xs) {
    if (is_pair(xs)) {
        return xs[0];
    } else {
        throw new Error("head(xs) expects a pair as "
            + "argument xs, but encountered "+xs);
    }
}

// tail returns the second component of the given pair
// throws an exception if the argument is not a pair
// LOW-LEVEL FUNCTION, NOT JEDISCRIPT
function tail(xs) {
    if (is_pair(xs)) {
        return xs[1];
    } else {
        throw new Error("tail(xs) expects a pair as "
            + "argument xs, but encountered "+xs);
    }

}

// is_empty_list returns true if arg is []
// LOW-LEVEL FUNCTION, NOT JEDISCRIPT
function is_empty_list(xs) {
    if (array_test(xs)) {
        if (xs.length === 0) {
            return true;
        } else if (xs.length === 2) {
            return false;
        } else {
            throw new Error("is_empty_list(xs) expects empty list " +
                "or pair as argument xs, but encountered "+xs);
        }
    } else {
        return false;
    }
}

// is_list recurses down the list and checks that it ends with the empty list []
// does not throw any exceptions
// LOW-LEVEL FUNCTION, NOT JEDISCRIPT
function is_list(xs) {
    for ( ; ; xs = tail(xs)) {
		if (is_empty_list(xs)) {
			return true;
		} else if (!is_pair(xs)) {
            return false;
        }
    }
}

// list makes a list out of its arguments
// LOW-LEVEL FUNCTION, NOT JEDISCRIPT
function list() {
    var the_list = [];
    for (var i = arguments.length - 1; i >= 0; i--) {
        the_list = pair(arguments[i], the_list);
    }
    return the_list;
}

// list_to_vector returns vector that contains the elements of the argument list
// in the given order.
// list_to_vector throws an exception if the argument is not a list
// LOW-LEVEL FUNCTION, NOT JEDISCRIPT
function list_to_vector(lst){
    var vector = [];
    while (!is_empty_list(lst)){
        vector.push(head(lst));
        lst = tail(lst);
    }
    return vector;
}

// vector_to_list returns a list that contains the elements of the argument vector
// in the given order.
// vector_to_list throws an exception if the argument is not a vector
// LOW-LEVEL FUNCTION, NOT JEDISCRIPT
function vector_to_list(vector) {
    if (vector.length === 0) {
        return [];
    }

    var result = [];
    for (var i = vector.length - 1; i >= 0; i = i - 1) {
        result = pair(vector[i], result);
    }
    return result;
}

// returns the length of a given argument list
// throws an exception if the argument is not a list
function length(xs) {
    for (var i = 0; !is_empty_list(xs); ++i) {
		xs = tail(xs);
    }
    return i;
}

// map applies first arg f to the elements of the second argument,
// assumed to be a list.
// f is applied element-by-element:
// map(f,[1,[2,[]]]) results in [f(1),[f(2),[]]]
// map throws an exception if the second argument is not a list,
// and if the second argument is a non-empty list and the first
// argument is not a function.
function map(f, xs) {
    return (is_empty_list(xs))
        ? []
        : pair(f(head(xs)), map(f, tail(xs)));
}

// build_list takes a non-negative integer n as first argument,
// and a function fun as second argument.
// build_list returns a list of n elements, that results from
// applying fun to the numbers from 0 to n-1.
function build_list(n, fun) {
    function build(i, fun, already_built) {
        if (i < 0) {
            return already_built;
        } else {
            return build(i - 1, fun, pair(fun(i),
                        already_built));
        }
    }
    return build(n - 1, fun, []);
}

// for_each applies first arg fun to the elements of the list passed as
// second argument. fun is applied element-by-element:
// for_each(fun,[1,[2,[]]]) results in the calls fun(1) and fun(2).
// for_each returns true.
// for_each throws an exception if the second argument is not a list,
// and if the second argument is a non-empty list and the
// first argument is not a function.
function for_each(fun, xs) {
    if (!is_list(xs)) {
        throw new Error("for_each expects a list as argument xs, but " +
            "encountered " + xs);
    }
    for ( ; !is_empty_list(xs); xs = tail(xs)) {
        fun(head(xs));
    }
    return true;
}

// list_to_string returns a string that represents the argument list.
// It applies itself recursively on the elements of the given list.
// When it encounters a non-list, it applies toString to it.
function list_to_string(l) {
    if (array_test(l) && l.length === 0) {
        return "[]";
    } else {
        if (!is_pair(l)){
            return l.toString();
        }else{
            return "["+list_to_string(head(l))+","+list_to_string(tail(l))+"]";
        }
    }
}

// reverse reverses the argument list
// reverse throws an exception if the argument is not a list.
function reverse(xs) {
    if (!is_list(xs)) {
        throw new Error("reverse(xs) expects a list as argument xs, but " +
            "encountered " + xs);
    }
    var result = [];
    for ( ; !is_empty_list(xs); xs = tail(xs)) {
        result = pair(head(xs), result);
    }
    return result;
}

// append first argument list and second argument list.
// In the result, the [] at the end of the first argument list
// is replaced by the second argument list
// append throws an exception if the first argument is not a list
function append(xs, ys) {
    if (is_empty_list(xs)) {
        return ys;
    } else {
        return pair(head(xs), append(tail(xs), ys));
    }
}

// member looks for a given first-argument element in a given
// second argument list. It returns the first postfix sublist
// that starts with the given element. It returns [] if the
// element does not occur in the list
function member(v, xs){
    for ( ; !is_empty_list(xs); xs = tail(xs)) {
        if (head(xs) === v) {
            return xs;
        }
    }
    return [];
}

// removes the first occurrence of a given first-argument element
// in a given second-argument list. Returns the original list
// if there is no occurrence.
function remove(v, xs){
    if (is_empty_list(xs)) {
        return [];
    } else {
        if (v === head(xs)) {
            return tail(xs);
        } else {
            return pair(head(xs), remove(v, tail(xs)));
        }
    }
}

// Similar to remove. But removes all instances of v instead of just the first
function remove_all(v, xs) {
    if (is_empty_list(xs)) {
        return [];
    } else {
        if (v === head(xs)) {
            return remove_all(v, tail(xs));
        } else {
            return pair(head(xs), remove_all(v, tail(xs)))
        }
    }
}
// for backwards-compatibility
var removeAll = remove_all;

// equal computes the structural equality
// over its arguments
function equal(item1, item2){
    if (is_pair(item1) && is_pair(item2)) {
        return equal(head(item1), head(item2)) &&
            equal(tail(item1), tail(item2));
    } else if (array_test(item1) && item1.length === 0 &&
           array_test(item2) && item2.length === 0) {
        return true;
    } else {
        return item1 === item2;
    }
}

// assoc treats the second argument as an association,
// a list of (index,value) pairs.
// assoc returns the first (index,value) pair whose
// index equal (using structural equality) to the given
// first argument v. Returns false if there is no such
// pair
function assoc(v, xs){
    if (is_empty_list(xs)) {
        return false;
    } else if (equal(v, head(head(xs)))) {
        return head(xs);
    } else {
        return assoc(v, tail(xs));
    }
}

// filter returns the sublist of elements of given list xs
// for which the given predicate function returns true.
function filter(pred, xs){
    if (is_empty_list(xs)) {
        return xs;
    } else {
        if (pred(head(xs))) {
            return pair(head(xs), filter(pred, tail(xs)));
        } else {
            return filter(pred, tail(xs));
        }
    }
}

// enumerates numbers starting from start,
// using a step size of 1, until the number
// exceeds end.
function enum_list(start, end) {
    if (start > end) {
        return [];
    } else {
        return pair(start, enum_list(start + 1, end));
    }
}

// Returns the item in list lst at index n (the first item is at position 0)
function list_ref(xs, n) {
    if (n < 0) {
        throw new Error("list_ref(xs, n) expects a positive integer as " +
            "argument n, but encountered " + n);
    }

    for ( ; n > 0; --n) {
        xs = tail(xs);
    }
    return head(xs);
}

// accumulate applies given operation op to elements of a list
// in a right-to-left order, first apply op to the last element
// and an initial element, resulting in r1, then to the
// second-last element and r1, resulting in r2, etc, and finally
// to the first element and r_n-1, where n is the length of the
// list.
// accumulate(op,zero,list(1,2,3)) results in
// op(1, op(2, op(3, zero)))

function accumulate(op,initial,sequence) {
    if (is_empty_list(sequence)) {
        return initial;
    } else {
        return op(head(sequence),
                  accumulate(op,initial,tail(sequence)));
    }
}

// set_head(xs,x) changes the head of given pair xs to be x,
// throws an exception if the argument is not a pair
// LOW-LEVEL FUNCTION, NOT JEDISCRIPT

function set_head(xs,x) {
    if (is_pair(xs)) {
        xs[0] = x;
        return undefined;
    } else {
        throw new Error("set_head(xs,x) expects a pair as "
            + "argument xs, but encountered "+xs);
    }
}

// set_tail(xs,x) changes the tail of given pair xs to be x,
// throws an exception if the argument is not a pair
// LOW-LEVEL FUNCTION, NOT JEDISCRIPT

function set_tail(xs,x) {
    if (is_pair(xs)) {
        xs[1] = x;
        return undefined;
    } else {
        throw new Error("set_tail(xs,x) expects a pair as "
            + "argument xs, but encountered "+xs);
    }
}

function display(str) {
	var to_show = str;
    if (is_array(str) && str.length > 2) {
        to_show = '[' + str.toString() + ']';
	} else if (is_array(str) && is_empty_list(str)) {
		to_show = '[]';
	} else if (is_pair(str)) {
		to_show = '';
		var stringize = function(item) {
			if (is_empty_list(item)) {
				return '[]';
			} else if (is_pair(item)) {
				return '[' + stringize(head(item)) + ', ' + stringize(tail(item)) + ']';
			} else {
				return item.toString();
			}
		}
		to_show = stringize(str);
	}
	//process.stdout.write(to_show);
	if (typeof to_show === 'function' && to_show.toString) {
		console.log(to_show.toString());
	} else {
		console.log(to_show);
	}
	return str;
}
;
Object.defineProperty(Object.prototype, "Inherits", {value: function( parent )
{
	parent.apply(this, Array.prototype.slice.call(arguments, 1));
}});

Object.defineProperty(Function.prototype, "Inherits", {value: function( parent )
{
	var dummyType = (new Function("return function " + parent.name + "() {}"))();
	dummyType.prototype = parent.prototype;
	this.prototype = new dummyType();
	Object.defineProperty(this.prototype, "constructor", {value: this});
}});

function is_instance_of(a, b) {
	return (a instanceof b);
}
;
// stream.js: Supporting streams in the Scheme style, following
//            "stream discipline"
// A stream is either the empty list or a pair whose tail is
// a nullary function that returns a stream.

// Author: Martin Henz

// stream_tail returns the second component of the given pair
// throws an exception if the argument is not a pair
// LOW-LEVEL FUNCTION, NOT JEDISCRIPT
function stream_tail(xs) {
    if (is_pair(xs)) {
        var tail = xs[1];
	if (typeof tail === "function") {
	    return tail();
	} else
            throw new Error("stream_tail(xs) expects a function as "
			    + "the tail of the argument pair xs, "
			    + "but encountered "+tail);
    } else {
        throw new Error("stream_tail(xs) expects a pair as "
			+ "argument xs, but encountered "+xs);
    }

}

// is_stream recurses down the stream and checks that it ends with
// the empty list []; does not throw any exceptions
// LOW-LEVEL FUNCTION, NOT JEDISCRIPT
// Lazy? No: is_stream needs to go down the stream
function is_stream(xs) {
    return (array_test(xs) && xs.length === 0)
	|| (is_pair(xs) && typeof tail(xs) === "function" &&
            is_stream(stream_tail(xs)));
}

// list_to_stream transforms a given list to a stream
// Lazy? Yes: list_to_stream goes down the list only when forced
function list_to_stream(xs) {
    if (is_empty_list(xs)) {
	return [];
    } else {
	return pair(head(xs),function() { return list_to_stream(tail(xs)); });
    }
}

// stream_to_list transforms a given stream to a list
// Lazy? No: stream_to_list needs to force the whole stream
function stream_to_list(xs) {
    if (is_empty_list(xs)) {
	return [];
    } else {
	return pair(head(xs), stream_to_list(stream_tail(xs)));
    }
}

// stream makes a stream out of its arguments
// LOW-LEVEL FUNCTION, NOT JEDISCRIPT
// Lazy? No: In this implementation, we generate first a
//           complete list, and then a stream using list_to_stream
function stream() {
    var the_list = [];
    for (var i = arguments.length - 1; i >= 0; i--) {
        the_list = pair(arguments[i], the_list);
    }
    return list_to_stream(the_list);
}

// stream_length returns the length of a given argument stream
// throws an exception if the argument is not a stream
// Lazy? No: The function needs to explore the whole stream
function stream_length(xs) {
    if (is_empty_list(xs)) {
	return 0;
    } else {
	return 1 + stream_length(stream_tail(xs));
    }
}

// stream_map applies first arg f to the elements of the second
// argument, assumed to be a stream.
// f is applied element-by-element:
// stream_map(f,list_to_stream([1,[2,[]]])) results in
// the same as list_to_stream([f(1),[f(2),[]]])
// stream_map throws an exception if the second argument is not a
// stream, and if the second argument is a non-empty stream and the
// first argument is not a function.
// Lazy? Yes: The argument stream is only explored as forced by
//            the result stream.
function stream_map(f, s) {
    if (is_empty_list(s)) {
	return [];
    } else {
	return pair(f(head(s)),
                    function() {
			return stream_map(f, stream_tail(s));
                    });
    }
}

// build_stream takes a non-negative integer n as first argument,
// and a function fun as second argument.
// build_list returns a stream of n elements, that results from
// applying fun to the numbers from 0 to n-1.
// Lazy? Yes: The result stream forces the applications of fun
//            for the next element
function build_stream(n, fun){
    function build(i) {
	if (i >= n) {
	    return [];
	} else {
	    return pair(fun(i),function() { return build(i + 1); });
	}
    }
    return build(0);
}

// stream_for_each applies first arg fun to the elements of the list
// passed as second argument. fun is applied element-by-element:
// for_each(fun,list_to_stream([1,[2,[]]])) results in the calls fun(1)
// and fun(2).
// stream_for_each returns true.
// stream_for_each throws an exception if the second argument is not a list,
// and if the second argument is a non-empty list and the
// first argument is not a function.
// Lazy? No: stream_for_each forces the exploration of the entire stream
function stream_for_each(fun,xs) {
    if (is_empty_list(xs)) {
	return true;
    } else {
        fun(head(xs));
	return stream_for_each(fun,stream_tail(xs));
    }
}

// stream_reverse reverses the argument stream
// stream_reverse throws an exception if the argument is not a stream.
// Lazy? No: stream_reverse forces the exploration of the entire stream
function stream_reverse(xs) {
    function rev(original, reversed) {
	if (is_empty_list(original)) {
	    return reversed;
	} else {
	    return rev(stream_tail(original),
		       pair(head(original), function() {return reversed;}));
	}
    }
    return rev(xs,[]);
}

// stream_to_vector returns vector that contains the elements of the argument
// stream in the given order.
// stream_to_vector throws an exception if the argument is not a stream
// LOW-LEVEL FUNCTION, NOT JEDISCRIPT
// Lazy? No: stream_to_vector forces the exploration of the entire stream
function stream_to_vector(lst){
    var vector = [];
    while(!is_empty_list(lst)){
        vector.push(head(lst));
        lst = stream_tail(lst);
    }
    return vector;
}

// stream_append appends first argument stream and second argument stream.
// In the result, the [] at the end of the first argument stream
// is replaced by the second argument stream
// stream_append throws an exception if the first argument is not a
// stream.
// Lazy? Yes: the result stream forces the actual append operation
function stream_append(xs, ys) {
    if (is_empty_list(xs)) {
	return ys;
    } else {
	return pair(head(xs),
		    function() { return stream_append(stream_tail(xs), ys); });
    }
}

// stream_member looks for a given first-argument element in a given
// second argument stream. It returns the first postfix substream
// that starts with the given element. It returns [] if the
// element does not occur in the stream
// Lazy? Sort-of: stream_member forces the stream only until the element is found.
function stream_member(x, s) {
    if (is_empty_list(s)) {
        return [];
    } else if (head(s) === x) {
        return s;
    } else {
        return stream_member(x, stream_tail(s));
    }
}

// stream_remove removes the first occurrence of a given first-argument element
// in a given second-argument list. Returns the original list
// if there is no occurrence.
// Lazy? Yes: the result stream forces the construction of each next element
function stream_remove(v, xs){
    if (is_empty_list(xs)) {
	return [];
    } else {
	if (v === head(xs)) {
	    return stream_tail(xs);
	} else {
	    return pair(head(xs),
			function() { return stream_remove(v, stream_tail(xs)); });
	}
    }
}

// stream_remove_all removes all instances of v instead of just the first.
// Lazy? Yes: the result stream forces the construction of each next element
function stream_remove_all(v, xs) {
    if (is_empty_list(xs)) {
	return [];
    } else {
	if (v === head(xs)) {
	    return stream_remove_all(v, stream_tail(xs));
	} else {
	    return pair(head(xs),
			function() { return stream_remove_all(v, stream_tail(xs)); });
	}
    }
}

// filter returns the substream of elements of given stream s
// for which the given predicate function p returns true.
// Lazy? Yes: The result stream forces the construction of
//            each next element. Of course, the construction
//            of the next element needs to go down the stream
//            until an element is found for which p holds.
function stream_filter(p, s) {
    if (is_empty_list(s)) {
	return [];
    } else if (p(head(s))) {
	return pair(head(s),
                    function() {
			return stream_filter(p,
					     stream_tail(s));
                    });
    } else {
	return stream_filter(p,
                             stream_tail(s));
    }
	      }

// enumerates numbers starting from start,
// using a step size of 1, until the number
// exceeds end.
// Lazy? Yes: The result stream forces the construction of
//            each next element
function enum_stream(start, end) {
    if (start > end) {
	return [];
    } else {
	return pair(start,
		    function() { return enum_stream(start + 1, end); });
    }
}

// integers_from constructs an infinite stream of integers
// starting at a given number n
// Lazy? Yes: The result stream forces the construction of
//            each next element
function integers_from(n) {
    return pair(n,
                function() {
                    return integers_from(n + 1);
                });
}

// eval_stream constructs the list of the first n elements
// of a given stream s
// Lazy? Sort-of: eval_stream only forces the computation of
//                the first n elements, and leaves the rest of
//                the stream untouched.
function eval_stream(s, n) {
    if (n === 0) {
        return [];
    } else {
        return pair(head(s),
                    eval_stream(stream_tail(s),
                                n - 1));
   }
}

// Returns the item in stream s at index n (the first item is at position 0)
// Lazy? Sort-of: stream_ref only forces the computation of
//                the first n elements, and leaves the rest of
//                the stream untouched.
function stream_ref(s, n) {
    if (n === 0) {
	return head(s);
    } else {
	return stream_ref(stream_tail(s), n - 1);
    }
}
;/**
 * Parses the given string and returns the evaluated result.
 *
 * @param String string The string to evaluate.
 * @returns The result of evaluating the given expression/program text.
 */
var parse_and_evaluate = undefined;
/**
 * Registers a native JavaScript function for use within the interpreter.
 *
 * @param String name The name of the function to expose.
 * @param Function func The Function to export.
 */
var parser_register_native_function = undefined;
/**
 * Registers a native JavaScript variable for use within the interpreter.
 *
 * @param String name The name of the variable to expose.
 * @param Object object The Object to export.
 */
var parser_register_native_variable = undefined;
/**
 * Registers a native JavaScript handler for when a debug context is changed.
 *
 * @param Function handler The callback handling all such requests. This
 *                         callback accepts one argument, the line of the
 *                         call. If this is null, then there is no debug
 *                         context active.
 */
var parser_register_debug_handler = undefined;

function parse(sourceText) {
	return JFDIRuntime.parse(sourceText);
}

function stmt_line(stmt) {
	return stmt.line;
}
function is_tagged_object(stmt,the_tag) {
	return is_object(stmt) &&
		stmt.tag === the_tag;
}

function is_self_evaluating(stmt) {
	return is_number(stmt) ||
		is_string(stmt) ||
		is_boolean(stmt);
}

function is_empty_list_statement(stmt) {
	return is_tagged_object(stmt,"empty_list");
}

function evaluate_empty_list_statement(input_text,stmt,env) {
	return [];
}

function make_undefined_value() {
	return undefined;
}

function is_undefined_value(value) {
	return value === undefined;
}

function is_variable(stmt) {
	return is_tagged_object(stmt,"variable");
}

function variable_name(stmt) {
	return stmt.name;
}

function enclosing_environment(env) {
	return tail(env);
}
function first_frame(env) {
	return head(env);
}
var the_empty_environment = [];
function is_empty_environment(env) {
	return is_empty_list(env);
}
function enclose_by(frame,env) {
	return pair(frame,env);
}

function lookup_variable_value(variable,env) {
	function env_loop(env) {
		if (is_empty_environment(env)) {
			error("Unbound variable: " + variable);
		} else if (has_binding_in_frame(variable,first_frame(env))) {
			return first_frame(env)[variable];
		} else {
			return env_loop(enclosing_environment(env));
		}
	}
	var val = env_loop(env);
	return val;
}

function is_assignment(stmt) {
	return is_tagged_object(stmt,"assignment");
}
function assignment_variable(stmt) {
	return stmt.variable;
}
function assignment_value(stmt) {
	return stmt.value;
}

function set_variable_value(variable,value,env) {
	function env_loop(env) {
		if (is_empty_environment(env)) {
			error("Undeclared variable in assignment: " + variable_name(variable));
		} else if (has_binding_in_frame(variable_name(variable),first_frame(env))) {
			add_binding_to_frame(variable_name(variable),value,first_frame(env));
		} else {
			env_loop(enclosing_environment(env));
		}
	}
	env_loop(env);
	return undefined;
}

function evaluate_assignment(input_text,stmt,env) {
	var value = evaluate(input_text,assignment_value(stmt),env);
	set_variable_value(assignment_variable(stmt),
		value,
		env);
	return value;
}

function is_array_expression(stmt) {
	return is_tagged_object(stmt,"arrayinit");
}

function array_expression_elements(stmt) {
	return stmt.elements;
}

function evaluate_array_expression(input_text,stmt, env) {
	var evaluated_elements = map(function(p) {
			return evaluate(input_text,p,env);
		},
		array_expression_elements(stmt));

	return list_to_vector(evaluated_elements);
}

function is_object_expression(stmt) {
	return is_tagged_object(stmt,"object");
}

function object_expression_pairs(stmt) {
	return stmt.pairs;
}

function evaluate_object_expression(input_text,stmt,env) {
	var evaluated_pairs = map(function(p) {
			return pair(evaluate(input_text,head(p),env),
				evaluate(input_text,tail(p),env));
		},
		object_expression_pairs(stmt));

	function make_object(pairs_to_handle, constructed_object) {
		if (is_empty_list(pairs_to_handle)) {
			return constructed_object;
		} else {
			constructed_object[head(head(pairs_to_handle))] =
				tail(head(pairs_to_handle));
			return make_object(tail(pairs_to_handle), constructed_object);
		}
	}
	return make_object(evaluated_pairs,{});
}



function is_property_assignment(stmt) {
	return is_tagged_object(stmt,"property_assignment");
}

function property_assignment_object(stmt) {
	return stmt.object;
}

function property_assignment_property(stmt) {
	return stmt.property;
}

function property_assignment_value(stmt) {
	return stmt.value;
}

function evaluate_property_assignment(input_text,stmt,env) {
	var obj = evaluate(input_text,property_assignment_object(stmt),env);
	var property = evaluate(input_text,property_assignment_property(stmt),env);
	var value = evaluate(input_text,property_assignment_value(stmt),env);
	obj[property] = value;
	return value;
}

function is_property_access(stmt) {
	var x = is_tagged_object(stmt,"property_access");
	return x;
}

function property_access_object(stmt) {
	return stmt.object;
}

function property_access_property(stmt) {
	return stmt.property;
}

/**
 * Evaluates a property access statement.
 */
function evaluate_property_access(input_text,statement,env) {
	var objec = evaluate(input_text,property_access_object(statement),env);
	var property = evaluate(input_text,property_access_property(statement),env);
	return evaluate_object_property_access(objec, property);
}

/**
 * Actually does the property access.
 */
function evaluate_object_property_access(object, property) {
	var result = object[property];

	//We need to post-process the return value. Because objects can be native
	//we need to marshal native member functions into our primitive tag.
	return wrap_native_value(result);
}

function is_var_definition(stmt) {
	return is_tagged_object(stmt,"var_definition");
}
function var_definition_variable(stmt) {
	return stmt.variable;
}
function var_definition_value(stmt) {
	return stmt.value;
}

function make_frame(variables,values) {
	if (is_empty_list(variables) && is_empty_list(values)) {
		return {};
	} else {
		var frame = make_frame(tail(variables),tail(values));
		frame[head(variables)] = head(values);
		return frame;
	}
}

function add_binding_to_frame(variable,value,frame) {
	frame[variable] = value;
	return undefined;
}
function has_binding_in_frame(variable,frame) {
	return has_own_property(frame, variable);
}

function define_variable(variable,value,env) {
	var frame = first_frame(env);
	return add_binding_to_frame(variable,value,frame);
}

function evaluate_var_definition(input_text,stmt,env) {
	define_variable(var_definition_variable(stmt),
		evaluate(input_text,var_definition_value(stmt),env),
		env);
	return undefined;
}

function is_if_statement(stmt) {
	return is_tagged_object(stmt,"if");
}
function if_predicate(stmt) {
	return stmt.predicate;
}
function if_consequent(stmt) {
	return stmt.consequent;
}
function if_alternative(stmt) {
	return stmt.alternative;
}

function is_true(x) {
	return ! is_false(x);
}
function is_false(x) {
	return x === false || x === 0 || x === "" || is_undefined_value(x) || is_NaN(x);
}

function is_boolean_operation(stmt) {
	return is_tagged_object(stmt, "boolean_op");
}

function evaluate_boolean_operation(input_text,stmt, args, env) {
	var lhs = evaluate(input_text,list_ref(args, 0), env);
	if (operator(stmt) === '||') {
		if (lhs) {
			return lhs;
		} else {
			return evaluate(input_text,list_ref(args, 1), env);
		}
	} else if (operator(stmt) === '&&') {
		if (!lhs) {
			return lhs;
		} else {
			return evaluate(input_text,list_ref(args, 1), env);
		}
	} else {
		error("Unknown binary operator: " + operator(stmt), stmt_line(stmt));
	}
}

function evaluate_if_statement(input_text,stmt,env) {
	if (is_true(evaluate(input_text,if_predicate(stmt),env))) {
		return evaluate(input_text,if_consequent(stmt),env);
	} else {
		return evaluate(input_text,if_alternative(stmt),env);
	}
}

function is_ternary_statement(stmt) {
	return is_tagged_object(stmt, "ternary");
}
function ternary_predicate(stmt) {
	return stmt.predicate;
}
function ternary_consequent(stmt) {
	return stmt.consequent;
}
function ternary_alternative(stmt) {
	return stmt.alternative;
}
function evaluate_ternary_statement(input_text,stmt, env) {
	if (is_true(evaluate(input_text,ternary_predicate(stmt), env))) {
		return evaluate(input_text,ternary_consequent(stmt), env);
	} else {
		return evaluate(input_text,ternary_alternative(stmt), env);
	}
}

function is_while_statement(stmt) {
	return is_tagged_object(stmt, "while");
}
function while_predicate(stmt) {
	return stmt.predicate;
}
function while_statements(stmt) {
	return stmt.statements;
}
function evaluate_while_statement(input_text,stmt, env) {
	var result = undefined;
	while (is_true(evaluate(input_text,while_predicate(stmt), env))) {
		var new_result = evaluate(input_text,while_statements(stmt), env);
		if (is_return_value(new_result) ||
			is_tail_recursive_return_value(new_result)) {
			return new_result;
		} else if (is_break_value(new_result)) {
			break;
		} else if (is_continue_value(new_result)) {
			continue;
		} else {
			result = new_result;
		}
	}
	return result;
}

function is_for_statement(stmt) {
	return is_tagged_object(stmt, "for");
}
function for_initialiser(stmt) {
	return stmt.initialiser;
}
function for_predicate(stmt) {
	return stmt.predicate;
}
function for_finaliser(stmt) {
	return stmt.finaliser;
}
function for_statements(stmt) {
	return stmt.statements;
}
function evaluate_for_statement(input_text,stmt, env) {
	var result = undefined;
	for (evaluate(input_text,for_initialiser(stmt), env);
		is_true(evaluate(input_text,for_predicate(stmt), env));
		evaluate(input_text,for_finaliser(stmt), env)) {
		var new_result = evaluate(input_text,for_statements(stmt), env);

		if (is_return_value(new_result) ||
			is_tail_recursive_return_value(new_result)) {
			return new_result;
		} else if (is_break_value(new_result)) {
			break;
		} else if (is_continue_value(new_result)) {
			continue;
		} else {
			result = new_result;
		}
	}
	return result;
}

function is_function_definition(stmt) {
	return is_tagged_object(stmt,"function_definition");
}

function function_definition_name(stmt) {
	return stmt.name;
}
function function_definition_parameters(stmt) {
	return stmt.parameters;
}
function function_definition_body(stmt) {
	return stmt.body;
}
function function_definition_text_location(stmt) {
	return stmt.location;
}

function evaluate_function_definition(input_text,stmt,env) {
	return make_function_value(
		input_text,
		function_definition_name(stmt),
		function_definition_parameters(stmt),
		function_definition_body(stmt),
		function_definition_text_location(stmt),
		env);
}
function make_function_value(input_text,name,parameters,body,location,env) {
	var result = (new Function("apply", "wrap_native_value",
	"return function " + name + "() {\n\
		var args = map(wrap_native_value, vector_to_list(arguments));\n\
		return apply(arguments.callee, args, this);\n\
	}"))(apply, wrap_native_value);
	result.tag = "function_value";
	result.parameters = parameters;
	result.body = body;
	result.source_text = input_text;
	result.environment = env;

	var text = get_input_text(input_text,location.start_line, location.start_col,
		location.end_line, location.end_col);
	result.toString = function() {
		return text;
	};
	result.toSource = result.toString;
	return result;
}
function is_compound_function_value(f) {
	return is_tagged_object(f,"function_value");
}
function function_value_parameters(value) {
	return value.parameters;
}
function function_value_body(value) {
	return value.body;
}
function function_value_environment(value) {
	return value.environment;
}
function function_value_name(value) {
	return value.name;
}
function function_value_source_text(value) {
	return value.source_text;
}

function is_construction(stmt) {
	return is_tagged_object(stmt, "construction");
}
function construction_type(stmt) {
	return stmt.type;
}
function evaluate_construction_statement(input_text,stmt, env) {
	var typename = evaluate(input_text,construction_type(stmt), env);
	var type = lookup_variable_value(typename, env);
	var result = undefined;
	var extraResult = undefined;
	if (is_primitive_function(type)) {
		result = Object.create(primitive_implementation(type).prototype);
	} else {
		//TODO: This causes some problems because we add more fields to the prototype of the object.
		result = Object.create(type.prototype);
	}

	extraResult = apply(type, list_of_values(input_text,operands(stmt),env), result);

	//EcmaScript 5.1 Section 13.2.2 [[Construct]]
	if (is_object(extraResult)) {
		return extraResult
	} else {
		return result;
	}
}

function is_sequence(stmt) {
	return is_list(stmt);
}
function empty_stmt(stmts) {
	return is_empty_list(stmts);
}
function last_stmt(stmts) {
	return is_empty_list(tail(stmts));
}
function first_stmt(stmts) {
	return head(stmts);
}
function rest_stmts(stmts) {
	return tail(stmts);
}

function evaluate_sequence(input_text,stmts,env) {
	while (!empty_stmt(stmts)) {
		var statement_result = evaluate(input_text,first_stmt(stmts), env);
		if (last_stmt(stmts)) {
			return statement_result;
		} else if (is_return_value(statement_result) ||
			is_tail_recursive_return_value(statement_result)) {
			return statement_result;
		} else if (is_break_value(statement_result) ||
			is_continue_value(statement_result)) {
			return statement_result;
		} else {
			stmts = rest_stmts(stmts);
		}
	}
}

function is_application(stmt) {
	return is_tagged_object(stmt,"application");
}
function is_object_method_application(stmt) {
	return is_tagged_object(stmt,"object_method_application");
}
function operator(stmt) {
	return stmt.operator;
}
function operands(stmt) {
	return stmt.operands;
}
function no_operands(ops) {
	return is_empty_list(ops);
}
function first_operand(ops) {
	return head(ops);
}
function rest_operands(ops) {
	return tail(ops);
}
function object(stmt) {
	return stmt.object;
}
function object_property(stmt) {
	return stmt.property;
}

function is_primitive_function(fun) {
	return is_tagged_object(fun,"primitive");
}
function primitive_implementation(fun) {
	return fun;
}

// This function is used to map whatever a native JavaScript function returns,
// and tags it such that the interpreter knows what to do with it.
// apply_in_underlying_javascript marshals interpreter to native; this handles
// the other direction.
function apply_in_underlying_javascript(prim,argument_list) {
   var argument_array = list_to_vector(argument_list);

   //Call prim with the same this argument as what we are running under.
   //this is populated with an object reference when we are an object. We
   //are not in this context, so this will usually be the window. Thus
   //passing this as the argument shouls behave. (Notably, passing the
   //function itself as a value of this is bad: if the function that is being
   //called assumes this to be window, we'll clobber the function value instead.
   //Also, alert won't work if we pass prim as the first argument.)
   return prim.apply(this, argument_array);
}

function wrap_native_value(val) {
	if (is_function(val) && val.tag === undefined) {
		return make_primitive_function_object(val);
	} else {
		return val;
	}
}
function apply_primitive_function(fun,argument_list,object) {
	return wrap_native_value(
		apply_in_underlying_javascript.call(object,primitive_implementation(fun),
			argument_list)
	);
}

function extend_environment(vars,vals,base_env) {
	var var_length = length(vars);
	var val_length = length(vals);
	if (var_length === val_length) {
		var new_frame = make_frame(vars,vals);
		return enclose_by(new_frame,base_env);
	} else if (var_length < val_length) {
		error("Too many arguments supplied: " + JSON.stringify(vars) +
			JSON.stringify(vals));
	} else {
		error("Too few arguments supplied: " + JSON.stringify(vars) +
			JSON.stringify(vals));
	}
}

function is_break_statement(stmt) {
	return is_tagged_object(stmt, "break_statement");
}

function make_break_value() {
	return { tag: "break_value" };
}

function is_break_value(value) {
	return is_tagged_object(value, "break_value");
}

function is_continue_statement(stmt) {
	return is_tagged_object(stmt, "continue_statement");
}

function make_continue_value() {
	return { tag: "continue_value" };
}

function is_continue_value(value) {
	return is_tagged_object(value, "continue_value");
}

function is_return_statement(stmt) {
	return is_tagged_object(stmt,"return_statement");
}
function return_statement_expression(stmt) {
	return stmt.expression;
}

function make_return_value(content) {
	return { tag: "return_value", content: content };
}
function is_return_value(value) {
	return is_tagged_object(value,"return_value");
}
function return_value_content(value) {
	return value.content;
}
function make_tail_recursive_return_value(fun, args, obj, env) {
	return { tag: "tail_recursive_return_value", fun: fun, args: args, obj: obj, env: env };
}
function is_tail_recursive_return_value(value) {
	return is_tagged_object(value, "tail_recursive_return_value");
}
function tail_recursive_function(value) {
	return value.fun;
}
function tail_recursive_arguments(value) {
	return value.args;
}
function tail_recursive_object(value) {
	return value.obj;
}
function tail_recursive_environment(value) {
	return value.env;
}

function apply(fun,args,obj) {
	var result = undefined;
	while (result === undefined || is_tail_recursive_return_value(result)) {
		if (is_primitive_function(fun)) {
			return apply_primitive_function(fun,args,obj);
		} else if (is_compound_function_value(fun)) {
			if (length(function_value_parameters(fun)) === length(args)) {
				var env = extend_environment(function_value_parameters(fun),
						args,
						function_value_environment(fun));
				if (obj && is_object(obj)) {
					add_binding_to_frame("this", obj, first_frame(env));
				} else {}

				//We have to pass in the source text we had at the function evaluation
				//time because we might evaluate new functions within and those would
				//require original input (since we hold references to the original
				//source text)
				var result = evaluate(function_value_source_text(fun),function_value_body(fun), env);
				if (is_return_value(result)) {
					return return_value_content(result);
				} else if (is_tail_recursive_return_value(result)) {
					fun = tail_recursive_function(result);
					args = tail_recursive_arguments(result);
					obj = tail_recursive_object(result);
					env = tail_recursive_environment(result);
				} else if (is_break_value(result) || is_continue_value(result)) {
					error("break and continue not allowed outside of function.");
				} else {
					return undefined;
				}
			} else {
				error('Incorrect number of arguments supplied for function ' +
					function_value_name(fun));
			}
		} else if (fun === undefined) {
			error("Unknown function type for application: undefined");
		} else {
			error("Unknown function type for application: " + JSON.stringify(fun),
				stmt_line(fun));
		}
	}
}

function list_of_values(input_text,exps,env) {
	if (no_operands(exps)) {
		return [];
	} else {
		return pair(evaluate(input_text,first_operand(exps),env),
			list_of_values(input_text,rest_operands(exps),env));
	}
}

var primitive_functions =
	list(
	//Builtin functions
	pair("alert", alert),
	pair("prompt", prompt),
	pair("parseInt", parseInt),

	//List library functions
	pair("pair", pair),
	pair("head", head),
	pair("tail", tail),
	pair("list", list),
	pair("length", length),
	pair("map", map),
	pair("is_empty_list", is_empty_list),

	//Intepreter functions
	pair("parse", parse),
	pair("error", error),

	//Primitive functions
	pair("+", function(x,y) { return x + y; }),
	pair("-", function(x,y) { return x - y; }),
	pair("*", function(x,y) { return x * y; }),
	pair("/", function(x,y) { return x / y; }),
	pair("%", function(x,y) { return x % y; }),
	pair("===", function(x,y) { return x === y; }),
	pair("!==", function(x,y) { return x !== y; }),
	pair("<", function(x,y) { return x < y; }),
	pair(">", function(x,y) { return x > y; }),
	pair("<=", function(x,y) { return x <= y; }),
	pair(">=", function(x,y) { return x >= y; }),
	pair("!", function(x) { return ! x; })
	);

function primitive_function_names() {
	return map(function(x) { return head(x); },
		primitive_functions);
}

function primitive_function_objects() {
	return map(
		function(f) {
			if (!is_compound_function_value(tail(f))) {
				return make_primitive_function_object(tail(f));
			} else {
				return tail(f);
			}
		},
		primitive_functions);
}

function make_primitive_function_object(primitive_function) {
	if (primitive_function.tag && primitive_function.tag !== "primitive") {
		error('Cannot tag an already tagged object: ' + JSON.stringify(primitive_function) + '/' + primitive_function + '/' + primitive_function.tag);
	} else {}
	primitive_function.tag = "primitive";
	return primitive_function;
}

var expires = undefined;
function evaluate(input_text,stmt,env) {
	if ((new Date()).getTime() > expires) {
		error('Time limit exceeded.');
	} else if (is_self_evaluating(stmt)) {
		return stmt;
	} else if (is_empty_list_statement(stmt)) {
		return evaluate_empty_list_statement(input_text,stmt,env);
	} else if (is_variable(stmt)) {
		return lookup_variable_value(variable_name(stmt),env);
	} else if (is_assignment(stmt)) {
		return evaluate_assignment(input_text,stmt,env);
	} else if (is_var_definition(stmt)) {
		return evaluate_var_definition(input_text,stmt,env);
	} else if (is_if_statement(stmt)) {
		return evaluate_if_statement(input_text,stmt,env);
	} else if (is_ternary_statement(stmt)) {
		return evaluate_ternary_statement(input_text,stmt,env);
	} else if (is_while_statement(stmt)) {
		return evaluate_while_statement(input_text,stmt,env);
	} else if (is_for_statement(stmt)) {
		return evaluate_for_statement(input_text,stmt,env);
	} else if (is_function_definition(stmt)) {
		return evaluate_function_definition(input_text,stmt,env);
	} else if (is_sequence(stmt)) {
		return evaluate_sequence(input_text,stmt,env);
	} else if (is_boolean_operation(stmt)) {
		return evaluate_boolean_operation(input_text,
			stmt,
			operands(stmt),
			env);
	} else if (is_application(stmt)) {
		var fun = evaluate(input_text,operator(stmt),env);
		var args = list_of_values(input_text,operands(stmt),env);
		var context = object(stmt) ? evaluate(input_text,object(stmt),env) : window;

		// We need to be careful. If we are calling debug() then we need
		// to give the environment to throw.
		if (fun === debug_break) {
			debug_break(env, stmt_line(stmt));
			// no return, exception thrown
		} else {
			return apply(fun, args, context);
		}
	} else if (is_object_method_application(stmt)) {
		var obj = object(stmt) ? evaluate(input_text,object(stmt),env) : window;
		if (!is_object(obj)) {
			error('Cannot apply object method on non-object');
		} else {
			var op = evaluate_object_property_access(obj,
				evaluate(input_text, object_property(stmt), env));
			return apply(op,
				list_of_values(input_text, operands(stmt), env),
				obj);
		}
	} else if (is_break_statement(stmt)) {
		return make_break_value();
	} else if (is_continue_statement(stmt)) {
		return make_continue_value();
	} else if (is_return_statement(stmt)) {
		//Tail-call optimisation.
		//Tail-calls are return statements which have no deferred operations,
		//and they return the result of another function call.
		if (is_application(return_statement_expression(stmt)) &&
					is_variable(operator(return_statement_expression(stmt)))) {
			//Over here, if our return expression is simply an expression, we return
			//a deferred evaluation. Apply will see these, and run it in a while
			//loop instead.
			//
			//To make Apply homogenous, we need to do some voodoo to evaluate
			//the operands in the function application, but NOT actually apply
			//the function.
			var fun = evaluate(input_text,operator(return_statement_expression(stmt)), env);
			var arguments = list_of_values(input_text,operands(return_statement_expression(stmt)), env);
			var obj = object(stmt) ? evaluate(input_text,object(return_statement_expression(stmt)), env) : window;
			return make_tail_recursive_return_value(fun, arguments, obj, env);
		} else {
			return make_return_value(
				evaluate(input_text,return_statement_expression(stmt),
				env));
		}
	} else if (is_array_expression(stmt)) {
		return evaluate_array_expression(input_text,stmt,env);
	} else if (is_object_expression(stmt)) {
		return evaluate_object_expression(input_text,stmt,env);
	} else if (is_construction(stmt)) {
		return evaluate_construction_statement(input_text,stmt,env);
	} else if (is_property_access(stmt)) {
		return evaluate_property_access(input_text,stmt,env);
	} else if (is_property_assignment(stmt)) {
		return evaluate_property_assignment(input_text,stmt,env);
	} else {
		error("Unknown expression type: " + JSON.stringify(stmt),
			stmt_line(stmt));
	}
}

function evaluate_toplevel(input_text,stmt,env) {
	var value = evaluate(input_text,stmt,env);
	if (is_return_value(value) || is_tail_recursive_return_value(value)) {
		error("return not allowed outside of function definition");
	} else if (is_break_value(value) || is_continue_value(value)) {
		error("break and continue not allowed outside of function.");
	} else {
		return value;
	}
}

/// The top-level environment.
var the_global_environment = (function() {
	var initial_env = extend_environment(primitive_function_names(),
		primitive_function_objects(),
		the_empty_environment);
	define_variable("undefined", make_undefined_value(), initial_env);
	define_variable("NaN", NaN, initial_env);
	define_variable("Infinity", Infinity, initial_env);
	define_variable("window", window, initial_env);
	define_variable("debug", debug_break, initial_env);
	define_variable("debug_resume",
		make_primitive_function_object(debug_resume),
		initial_env);
	return initial_env;
})();

/// For initialising /other/ toplevel environments.
///
/// By default this is the global environment. However, if a program forces early
/// termination, we will install the current environment so that we can evaluate
/// expressions in the "debug" environment. This allows debugging.
var environment_stack = [the_global_environment];
environment_stack.top = function() {
	if (this.length === 0) {
		return null;
	} else {
		return this[this.length - 1];
	}
};

function driver_loop() {
	var program_string = read("Enter your program here: ");
	var program_syntax = parse(program_string);
	if (is_tagged_object(program_syntax,"exit")) {
		return "interpreter completed";
	} else {
		var output = evaluate_toplevel(
			string.replace(new RegExp('\r\n', 'g'), '\n').replace(new RegExp('\r', 'g'), '\n').split('\n'),
			program_syntax, environment_stack.top());
		write(output);
		return driver_loop();
	}
}

function get_input_text(input_text, start_line, start_col, end_line, end_col) {
	//Fix index-from-line 1
	start_line = start_line - 1;
	end_line = end_line - 1;

	if (start_line === end_line) {
		return input_text[start_line].substr(start_col, end_col - start_col + 1);
	} else {
		var result = '';
		var i = start_line;
		result = result + input_text[start_line].substr(start_col) + '\n';

		for (i = i + 1; i < end_line; i = i + 1) {
			result = result + input_text[i] + '\n';
		}

		result = result + input_text[end_line].substr(0, end_col + 1);
		return result;
	}
}

/// \section Debugging support
function DebugException(environment, line) {
	this.environment = environment;
	this.line = line;
}

/// The registered debug handler. If this is set, when debug_break is called,
/// this handler will get triggered with the line number of the triggering
/// call.
var debug_handler = null;

/// Breaks the interpreter, throwing the environment to the top level.
function debug_break(env, line) {
	throw new DebugException(env, line);
}

/// Handles the exception generated by debug_break, installing it to
/// the top level.
function debug_handle(exception) {
	environment_stack.push(exception.environment);
	console.warn("Debugger environment initialised.");

	if (debug_handler) {
		debug_handler(exception.line);
	}
}

/// Removes the top environment from the environment stack.
function debug_resume() {
	if (environment_stack.length > 1) {
		environment_stack.pop();
		console.log("Environment restored.");

		if (environment_stack.length === 1 && debug_handler) {
			debug_handler(null);
		}
	} else {
		console.log("No environments to restore.");
	}
}

function debug_evaluate_toplevel() {
	try {
		return evaluate_toplevel.apply(this, arguments);
	} catch (e) {
		if (e instanceof DebugException) {
			debug_handle(e);
		} else {
			throw e;
		}
	}
}

//Public functions
/// Parses and evaluates the given program source text, with an optional timeout
/// where an exception (time limit exceeded) is thrown.
/// \param[in] string The program text string to run as the program code.
/// \param[in] timeout The timeout in milliseconds before code execution is
///                    interrupted.
parse_and_evaluate = function(string, timeout) {
	if (timeout) {
		expires = (new Date()).getTime() + timeout;
	} else {
		expires = undefined;
	}

	var result = debug_evaluate_toplevel(
		string.replace(new RegExp('\r\n', 'g'), '\n').replace(new RegExp('\r', 'g'), '\n').split('\n'),
		parse(string),
		environment_stack.top());

	// Reset the timeout.
	expires = undefined;
	return result;
};

parser_register_native_function = function(name, func) {
	if (!is_function(func) && !is_primitive_function(func)) {
		error("parser_register_native_function can only be used to register " +
			"functions: " + JSON.stringify(func) + " given.");
	} else if (is_primitive_function(func)) {
		//No need to wrap another layer of indirection
		add_binding_to_frame(name, func,
			first_frame(the_global_environment));
	} else {
		add_binding_to_frame(name, make_primitive_function_object(func),
			first_frame(the_global_environment));
	}
};

parser_register_native_variable = function(name, object) {
	if (is_object(object) && is_function(object)) {
		error("parser_register_native_variable can only be used to register " +
			"variables.");
	} else {
		define_variable(name, object, the_global_environment);
	}
};

parser_register_debug_handler = function(handler) {
	debug_handler = handler;
}
;(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        //Allow using this built library as an AMD module
        //in another project. That other project will only
        //see this AMD call, not the internal modules in
        //the closure below.
        define([], factory);
    } else if (typeof process !== 'undefined' && process.argv[0].indexOf("node") !== -1) {
        //Browser globals case. Just assign the
        //result to a property on the global.
        global.JFDIRuntime = factory();
    } else {
        root.JFDIRuntime = factory();
    }
}(this, function () {
/**
 * @license almond 0.3.1 Copyright (c) 2011-2014, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*jslint sloppy: true */
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {
    var main, req, makeMap, handlers,
        defined = {},
        waiting = {},
        config = {},
        defining = {},
        hasOwn = Object.prototype.hasOwnProperty,
        aps = [].slice,
        jsSuffixRegExp = /\.js$/;

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        var nameParts, nameSegment, mapValue, foundMap, lastIndex,
            foundI, foundStarMap, starI, i, j, part,
            baseParts = baseName && baseName.split("/"),
            map = config.map,
            starMap = (map && map['*']) || {};

        //Adjust any relative paths.
        if (name && name.charAt(0) === ".") {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                name = name.split('/');
                lastIndex = name.length - 1;

                // Node .js allowance:
                if (config.nodeIdCompat && jsSuffixRegExp.test(name[lastIndex])) {
                    name[lastIndex] = name[lastIndex].replace(jsSuffixRegExp, '');
                }

                //Lop off the last part of baseParts, so that . matches the
                //"directory" and not name of the baseName's module. For instance,
                //baseName of "one/two/three", maps to "one/two/three.js", but we
                //want the directory, "one/two" for this normalization.
                name = baseParts.slice(0, baseParts.length - 1).concat(name);

                //start trimDots
                for (i = 0; i < name.length; i += 1) {
                    part = name[i];
                    if (part === ".") {
                        name.splice(i, 1);
                        i -= 1;
                    } else if (part === "..") {
                        if (i === 1 && (name[2] === '..' || name[0] === '..')) {
                            //End of the line. Keep at least one non-dot
                            //path segment at the front so it can be mapped
                            //correctly to disk. Otherwise, there is likely
                            //no path mapping for a path starting with '..'.
                            //This can still fail, but catches the most reasonable
                            //uses of ..
                            break;
                        } else if (i > 0) {
                            name.splice(i - 1, 2);
                            i -= 2;
                        }
                    }
                }
                //end trimDots

                name = name.join("/");
            } else if (name.indexOf('./') === 0) {
                // No baseName, so this is ID is resolved relative
                // to baseUrl, pull off the leading dot.
                name = name.substring(2);
            }
        }

        //Apply map config if available.
        if ((baseParts || starMap) && map) {
            nameParts = name.split('/');

            for (i = nameParts.length; i > 0; i -= 1) {
                nameSegment = nameParts.slice(0, i).join("/");

                if (baseParts) {
                    //Find the longest baseName segment match in the config.
                    //So, do joins on the biggest to smallest lengths of baseParts.
                    for (j = baseParts.length; j > 0; j -= 1) {
                        mapValue = map[baseParts.slice(0, j).join('/')];

                        //baseName segment has  config, find if it has one for
                        //this name.
                        if (mapValue) {
                            mapValue = mapValue[nameSegment];
                            if (mapValue) {
                                //Match, update name to the new value.
                                foundMap = mapValue;
                                foundI = i;
                                break;
                            }
                        }
                    }
                }

                if (foundMap) {
                    break;
                }

                //Check for a star map match, but just hold on to it,
                //if there is a shorter segment match later in a matching
                //config, then favor over this star map.
                if (!foundStarMap && starMap && starMap[nameSegment]) {
                    foundStarMap = starMap[nameSegment];
                    starI = i;
                }
            }

            if (!foundMap && foundStarMap) {
                foundMap = foundStarMap;
                foundI = starI;
            }

            if (foundMap) {
                nameParts.splice(0, foundI, foundMap);
                name = nameParts.join('/');
            }
        }

        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            var args = aps.call(arguments, 0);

            //If first arg is not require('string'), and there is only
            //one arg, it is the array form without a callback. Insert
            //a null so that the following concat is correct.
            if (typeof args[0] !== 'string' && args.length === 1) {
                args.push(null);
            }
            return req.apply(undef, args.concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (hasProp(waiting, name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        }

        if (!hasProp(defined, name) && !hasProp(defining, name)) {
            throw new Error('No ' + name);
        }
        return defined[name];
    }

    //Turns a plugin!resource to [plugin, resource]
    //with the plugin being undefined if the name
    //did not have a plugin prefix.
    function splitPrefix(name) {
        var prefix,
            index = name ? name.indexOf('!') : -1;
        if (index > -1) {
            prefix = name.substring(0, index);
            name = name.substring(index + 1, name.length);
        }
        return [prefix, name];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    makeMap = function (name, relName) {
        var plugin,
            parts = splitPrefix(name),
            prefix = parts[0];

        name = parts[1];

        if (prefix) {
            prefix = normalize(prefix, relName);
            plugin = callDep(prefix);
        }

        //Normalize according
        if (prefix) {
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relName));
            } else {
                name = normalize(name, relName);
            }
        } else {
            name = normalize(name, relName);
            parts = splitPrefix(name);
            prefix = parts[0];
            name = parts[1];
            if (prefix) {
                plugin = callDep(prefix);
            }
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            pr: prefix,
            p: plugin
        };
    };

    function makeConfig(name) {
        return function () {
            return (config && config.config && config.config[name]) || {};
        };
    }

    handlers = {
        require: function (name) {
            return makeRequire(name);
        },
        exports: function (name) {
            var e = defined[name];
            if (typeof e !== 'undefined') {
                return e;
            } else {
                return (defined[name] = {});
            }
        },
        module: function (name) {
            return {
                id: name,
                uri: '',
                exports: defined[name],
                config: makeConfig(name)
            };
        }
    };

    main = function (name, deps, callback, relName) {
        var cjsModule, depName, ret, map, i,
            args = [],
            callbackType = typeof callback,
            usingExports;

        //Use name if no relName
        relName = relName || name;

        //Call the callback to define the module, if necessary.
        if (callbackType === 'undefined' || callbackType === 'function') {
            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [require, exports, module] if no deps
            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
            for (i = 0; i < deps.length; i += 1) {
                map = makeMap(deps[i], relName);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = handlers.require(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = handlers.exports(name);
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = handlers.module(name);
                } else if (hasProp(defined, depName) ||
                           hasProp(waiting, depName) ||
                           hasProp(defining, depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else {
                    throw new Error(name + ' missing ' + depName);
                }
            }

            ret = callback ? callback.apply(defined[name], args) : undefined;

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef &&
                        cjsModule.exports !== defined[name]) {
                    defined[name] = cjsModule.exports;
                } else if (ret !== undef || !usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };

    requirejs = require = req = function (deps, callback, relName, forceSync, alt) {
        if (typeof deps === "string") {
            if (handlers[deps]) {
                //callback in this case is really relName
                return handlers[deps](callback);
            }
            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, callback).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            config = deps;
            if (config.deps) {
                req(config.deps, config.callback);
            }
            if (!callback) {
                return;
            }

            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = relName;
                relName = null;
            } else {
                deps = undef;
            }
        }

        //Support require(['a'])
        callback = callback || function () {};

        //If relName is a function, it is an errback handler,
        //so remove it.
        if (typeof relName === 'function') {
            relName = forceSync;
            forceSync = alt;
        }

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            //Using a non-zero value because of concern for what old browsers
            //do, and latest browsers "upgrade" to 4 if lower value is used:
            //http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#dom-windowtimers-settimeout:
            //If want a value immediately, use require('id') instead -- something
            //that works in almond on the global level, but not guaranteed and
            //unlikely to work in other AMD implementations.
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 4);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function (cfg) {
        return req(cfg);
    };

    /**
     * Expose module registry for debugging and tooling
     */
    requirejs._defined = defined;

    define = function (name, deps, callback) {
        if (typeof name !== 'string') {
            throw new Error('See almond README: incorrect module build, no module name');
        }

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        if (!hasProp(defined, name) && !hasProp(waiting, name)) {
            waiting[name] = [name, deps, callback];
        }
    };

    define.amd = {
        jQuery: true
    };
}());

define("../node_modules/almond/almond", function(){});

/**
 * @license almond 0.3.1 Copyright (c) 2011-2014, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */

(function(e,t){typeof define=="function"&&define.amd?define('../dist/jedi-runtime',[],t):typeof process!="undefined"&&process.argv[0].indexOf("node")!==-1?global.JediRuntime=t():e.JediRuntime=t()})(this,function(){var e,t,n;return function(r){function v(e,t){return h.call(e,t)}function m(e,t){var n,r,i,s,o,u,a,f,c,h,p,v=t&&t.split("/"),m=l.map,g=m&&m["*"]||{};if(e&&e.charAt(0)===".")if(t){e=e.split("/"),o=e.length-1,l.nodeIdCompat&&d.test(e[o])&&(e[o]=e[o].replace(d,"")),e=v.slice(0,v.length-1).concat(e);for(c=0;c<e.length;c+=1){p=e[c];if(p===".")e.splice(c,1),c-=1;else if(p===".."){if(c===1&&(e[2]===".."||e[0]===".."))break;c>0&&(e.splice(c-1,2),c-=2)}}e=e.join("/")}else e.indexOf("./")===0&&(e=e.substring(2));if((v||g)&&m){n=e.split("/");for(c=n.length;c>0;c-=1){r=n.slice(0,c).join("/");if(v)for(h=v.length;h>0;h-=1){i=m[v.slice(0,h).join("/")];if(i){i=i[r];if(i){s=i,u=c;break}}}if(s)break;!a&&g&&g[r]&&(a=g[r],f=c)}!s&&a&&(s=a,u=f),s&&(n.splice(0,u,s),e=n.join("/"))}return e}function g(e,t){return function(){var n=p.call(arguments,0);return typeof n[0]!="string"&&n.length===1&&n.push(null),s.apply(r,n.concat([e,t]))}}function y(e){return function(t){return m(t,e)}}function b(e){return function(t){a[e]=t}}function w(e){if(v(f,e)){var t=f[e];delete f[e],c[e]=!0,i.apply(r,t)}if(!v(a,e)&&!v(c,e))throw new Error("No "+e);return a[e]}function E(e){var t,n=e?e.indexOf("!"):-1;return n>-1&&(t=e.substring(0,n),e=e.substring(n+1,e.length)),[t,e]}function S(e){return function(){return l&&l.config&&l.config[e]||{}}}var i,s,o,u,a={},f={},l={},c={},h=Object.prototype.hasOwnProperty,p=[].slice,d=/\.js$/;o=function(e,t){var n,r=E(e),i=r[0];return e=r[1],i&&(i=m(i,t),n=w(i)),i?n&&n.normalize?e=n.normalize(e,y(t)):e=m(e,t):(e=m(e,t),r=E(e),i=r[0],e=r[1],i&&(n=w(i))),{f:i?i+"!"+e:e,n:e,pr:i,p:n}},u={require:function(e){return g(e)},exports:function(e){var t=a[e];return typeof t!="undefined"?t:a[e]={}},module:function(e){return{id:e,uri:"",exports:a[e],config:S(e)}}},i=function(e,t,n,i){var s,l,h,p,d,m=[],y=typeof n,E;i=i||e;if(y==="undefined"||y==="function"){t=!t.length&&n.length?["require","exports","module"]:t;for(d=0;d<t.length;d+=1){p=o(t[d],i),l=p.f;if(l==="require")m[d]=u.require(e);else if(l==="exports")m[d]=u.exports(e),E=!0;else if(l==="module")s=m[d]=u.module(e);else if(v(a,l)||v(f,l)||v(c,l))m[d]=w(l);else{if(!p.p)throw new Error(e+" missing "+l);p.p.load(p.n,g(i,!0),b(l),{}),m[d]=a[l]}}h=n?n.apply(a[e],m):undefined;if(e)if(s&&s.exports!==r&&s.exports!==a[e])a[e]=s.exports;else if(h!==r||!E)a[e]=h}else e&&(a[e]=n)},e=t=s=function(e,t,n,a,f){if(typeof e=="string")return u[e]?u[e](t):w(o(e,t).f);if(!e.splice){l=e,l.deps&&s(l.deps,l.callback);if(!t)return;t.splice?(e=t,t=n,n=null):e=r}return t=t||function(){},typeof n=="function"&&(n=a,a=f),a?i(r,e,t,n):setTimeout(function(){i(r,e,t,n)},4),s},s.config=function(e){return s(e)},e._defined=a,n=function(e,t,n){if(typeof e!="string")throw new Error("See almond README: incorrect module build, no module name");t.splice||(n=t,t=[]),!v(a,e)&&!v(f,e)&&(f[e]=[e,t,n])},n.amd={jQuery:!0}}(),n("node_modules/almond/almond",function(){}),n("lib/compiler/util",[],function(){"use strict";function e(e,t){this.message=e,this.line=t}function t(e){var t={values:[],table:{}};return e&&e.line!==undefined?(t.values.push(e),t.table[e.value]=!0):e&&(t.values.push(e),t.table[e]=!0),t}function n(e,t){var n=l(t);t&&t.line!==undefined&&(n=l(t.value)),e.table[n]||(e.table[n]=!0,e.values.push(t))}function r(e){function o(e){n(r,e)}var r=t(),i,s;for(i=0,s=e.length;i<s;++i)e[i].values.forEach(o);return r}function i(e,t,n,r,i){return{instructions:e||[],debug:t||[],parsed_functions:n||[],constant:r,constant_value:i}}function s(e){return{line:e,function_name:undefined}}function o(e){var t=i();for(var n=0,r=e.length;n<r;++n){var s=e[n];Array.prototype.push.apply(t.instructions,s.instructions),Array.prototype.push.apply(t.debug,s.debug),Array.prototype.push.apply(t.parsed_functions,s.parsed_functions)}return t}function a(){return":"+u++}function f(){u=0}function l(e){return"var#"+e+"#"}function c(e,t,n,r){return i([e],[s(t)],undefined,n,r)}function h(e,t){return{name:e,compile_result:null,parameters:["this"],source:t}}var u=0;return{CompileError:e,make_compile_result:i,make_debug_info:s,merge_compile_result:o,make_temporary_variable_name:a,reset_temporary_variable_name_counter:f,variable_name_hash:l,make_single_instruction:c,make_function_description:h,make_hash_set:t,merge_hash_set:r,add_to_hash_set:n}}),n("lib/vm/instruction",[],function(){"use strict";function e(e,t,n){this.name=e,this.value=t,this.source=n}return e}),n("lib/parser/nodes",[],function(){"use strict";function e(e){return e===null}function t(e){return e===undefined}function n(e){return typeof e=="number"}function r(e){return n(e)&&isNaN(e)}function i(e){return typeof e=="string"}function s(e){return typeof e=="boolean"}function o(e){return typeof e=="object"||d(e)}function u(e){return o(e)&&e instanceof Array}function a(e,t){return[e,t]}function f(e){return h(e)&&e.length===0}function l(e){return h(e)&&!f(e)?e[0]:undefined}function c(e){return h(e)&&!f(e)?e[1]:undefined}function h(e){return u(e)&&(e.length===0||e.length===2)}function p(e){return h(e)&&(f(e)||p(c(e)))}function d(e){return typeof e=="function"}function v(e,t){return o(e)&&e.tag===t}var m={stmt_line:function(e){return e.line},is_undefined_value:t,is_number:n,is_string:i,is_boolean:s,pair:a,is_empty_list:f,head:l,tail:c,no_op:function(){return null},is_sequence:p,empty_stmt:f,last_stmt:function(e){return f(c(e))},first_stmt:l,rest_stmts:c,if_statement:function(e,t,n,r){return{tag:"if",predicate:e,consequent:t,alternative:n,line:r}},is_if_statement:function(e){return v(e,"if")},if_predicate:function(e){return e.predicate},if_consequent:function(e){return e.consequent},if_alternative:function(e){return e.alternative},while_statement:function(e,t,n){return{tag:"while",predicate:e,statements:t,line:n}},is_while_statement:function(e){return v(e,"while")},while_predicate:function(e){return e.predicate},while_statements:function(e){return e.statements},for_statement:function(e,t,n,r,i){return{tag:"for",initialiser:e,predicate:t,finaliser:n,statements:r,line:i}},is_for_statement:function(e){return v(e,"for")},for_initialiser:function(e){return e.initialiser},for_predicate:function(e){return e.predicate},for_finaliser:function(e){return e.finaliser},for_statements:function(e){return e.statements},break_statement:function(e){return{tag:"break_statement",line:e}},is_break_statement:function(e){return v(e,"break_statement")},continue_statement:function(e){return{tag:"continue_statement",line:e}},is_continue_statement:function(e){return v(e,"continue_statement")},function_definition:function(e,t,n,r,i){return{tag:"function_definition",name:e,parameters:t,body:n,location:{start_line:r.first_line,start_col:r.first_column,start_offset:r.range[0],end_line:i.last_line,end_col:i.last_column,end_offset:i.range[1]},line:i.last_line-1}},is_function_definition:function(e){return v(e,"function_definition")},function_definition_name:function(e){return e.name},function_definition_parameters:function(e){return e.parameters},function_definition_body:function(e){return e.body},function_definition_text_location:function(e){return e.location},return_statement:function(e,t){return{tag:"return_statement",expression:e,line:t}},is_return_statement:function(e){return v(e,"return_statement")},return_statement_expression:function(e){return e.expression},variable_definition:function(e,t,n){return{tag:"var_definition",variable:e,value:t,line:n}},is_var_definition:function(e){return v(e,"var_definition")},var_definition_variable:function(e){return e.variable},var_definition_value:function(e){return e.value},assignment:function(e,t,n){return{tag:"assignment",variable:e,value:t,line:n}},is_assignment:function(e){return v(e,"assignment")},assignment_variable:function(e){return e.variable},assignment_value:function(e){return e.value},property_assignment:function(e,t,n,r){return{tag:"property_assignment",object:e,property:t,value:n,line:r}},is_property_assignment:function(e){return v(e,"property_assignment")},property_assignment_object:function(e){return e.object},property_assignment_property:function(e){return e.property},property_assignment_value:function(e){return e.value},eager_binary_expression:function(e,t,n,r){return m.application(m.variable(t,r),[e,[n,[]]],r)},eager_unary_expression:function(e,t,n){return m.application(m.variable(e,n),[t,[]],n)},boolean_operation:function(e,t,n,r){return{tag:"boolean_op",operator:t,operands:[e,[n,[]]],line:r}},is_boolean_operation:function(e){return v(e,"boolean_op")},property_access:function(e,t,n){return{tag:"property_access",object:e,property:t,line:n}},is_property_access:function(e){return v(e,"property_access")},property_access_object:function(e){return e.object},property_access_property:function(e){return e.property},variable:function(e,t){return{tag:"variable",name:e,line:t}},is_variable:function(e){return v(e,"variable")},variable_name:function(e){return e.name},application:function(e,t,n){return{tag:"application",operator:e,operands:t,line:n}},is_application:function(e){return v(e,"application")},operator:function(e){return e.operator},operands:function(e){return e.operands},no_operands:f,first_operand:l,rest_operands:c,object_method_application:function(e,t,n,r){return{tag:"object_method_application",object:e,property:t,operands:n,line:r}},is_object_method_application:function(e){return v(e,"object_method_application")},object:function(e){return e.object},object_property:function(e){return e.property},construction:function(e,t,n){return{tag:"construction",type:e,operands:t,line:n}},is_construction:function(e){return v(e,"construction")},construction_type:function(e){return e.type},ternary:function(e,t,n,r){return{tag:"ternary",predicate:e,consequent:t,alternative:n,line:r}},is_ternary_statement:function(e){return v(e,"ternary")},ternary_predicate:function(e){return e.predicate},ternary_consequent:function(e){return e.consequent},ternary_alternative:function(e){return e.alternative},is_self_evaluating:function(e){return n(e)||i(e)||s(e)},empty_list:function(e){return{tag:"empty_list",line:e}},is_empty_list_statement:function(e){return v(e,"empty_list")},array_literal:function(e,t){return{tag:"arrayinit",elements:e,line:t}},is_array_expression:function(e){return v(e,"arrayinit")},array_expression_elements:function(e){return e.elements},first_array_element:l,rest_array_elements:c,empty_array_element:f,object_literal:function(e,t){return{tag:"object",pairs:e,line:t}},is_object_expression:function(e){return v(e,"object")},object_expression_pairs:function(e){return e.pairs},first_object_expression_pair:l,rest_object_expression_pairs:c,empty_object_expression_pairs:f,object_expression_pair_key:l,object_expression_pair_value:c};return m}),n("lib/compiler/exception",[],function(){return{ClosureFormalRedeclarationException:function(e,t){this.line=t,this.message="\nOn line : "+t+"\n",this.message="Trying to redefine function formal parameter: ",this.message+=e+"\n",this.message+="This is forbidden by JediScript style guide."}}}),n("lib/compiler/instructionfactory",["lib/parser/nodes","lib/vm/instruction"],function(e,t){function n(e){return new t("GOTOR",e)}function r(e){return new t("JOFR",e)}function i(){return new t("RTN")}function s(e){return new t("DECLARE",e)}function o(e){return new t("STORE",e)}function u(e){return new t("LDS",e)}function a(e,n){return new t("LDF",e,n)}function f(e){return new t("CALL",e)}function l(e){return new t("TAILCALL",e)}function c(){return new t("DONE")}function h(){return new t("READPS")}function p(){return new t("STOREPS")}function d(e){return new t("LDCO",e)}function v(e){return new t("LDCA",e)}function m(e){return new t("CONSTRUCT",e)}function g(n){if(e.is_string(n))return new t("LDCS",n);if(e.is_number(n))return new t("LDCN",n);if(e.is_boolean(n))return new t("LDCB",n);if(e.is_undefined_value(n))return new t("LDU");throw new Util.CompileError("Unexpected primitive value",n)}return{make_goto_instruction:n,make_goto_on_false_instruction:r,make_return_instruction:i,make_declare_symbol_instruction:s,make_store_symbol_instruction:o,make_load_symbol_instruction:u,make_load_function_instruction:a,make_call_instruction:f,make_tail_call_instruction:l,make_done_instruction:c,make_read_object_property_instruction:h,make_store_object_property_instruction:p,make_load_literal_object_instruction:d,make_load_literal_array_instruction:v,make_construction_call_instruction:m,make_load_constant_value_instruction:g}}),n("lib/compiler/pseudoinstruction",[],function(){function e(e){return e.label}function t(t){return e(t)&&t.address_label}function r(){return{name:"label#"+n++,tag:"label",label:!0,address_label:!0}}function i(){n=0}function s(t){return e(t)&&t.tag==="goto_label"}function o(e){return{name:f(e),tag:"goto_label",label:!0}}function u(t){return e(t)&&t.tag==="false_goto_label"}function a(e){return{name:f(e),tag:"false_goto_label",label:!0}}function f(e){return e.name}function l(e){return e.tag==="break_marker"}function c(){return{tag:"break_marker"}}function h(e){return e.tag==="continue_marker"}function p(){return{tag:"continue_marker"}}function d(t){return e(t)&&t.tag==="function_load_label"}function v(e){return e.description}function m(e,t){return{name:f(e),source:t.source,description:t,tag:"function_load_label",label:!0}}function g(t){return e(t)&&t.tag==="call_label"}function y(e){return{tag:"call_label",count:e,label:!0}}function b(e){return e.count}function w(t){return e(t)&&t.tag==="return_label"}function E(){return{tag:"return_label",label:!0}}function S(t){return e(t)&&t.tag==="load_temporary_variable"}function x(e){return{label:!0,tag:"load_temporary_variable",name:e}}function T(t){return e(t)&&t.tag==="store_temporary_variable"}function N(e){return{label:!0,tag:"store_temporary_variable",name:e}}var n=0;return{is_label:e,is_address_label:t,make_address_label:r,reset_address_label:i,is_goto_label:s,make_goto_label:o,is_false_goto_label:u,make_false_goto_label:a,label_name:f,is_break_marker:l,make_break_marker:c,is_continue_marker:h,make_continue_marker:p,is_function_load_label:d,function_load_label_description:v,make_function_load_label:m,is_call_label:g,make_call_label:y,call_label_argument_length:b,is_return_label:w,make_return_label:E,is_store_temporary_variable_label:T,make_store_temporary_variable_label:N,is_load_temporary_variable_label:S,make_load_temporary_variable_label:x}}),n("lib/compiler/searchsymbol",["lib/parser/nodes","lib/compiler/util"],function(e,t){function n(e){return r(e).values}function r(n){return e.empty_stmt(n)?t.make_hash_set():e.is_if_statement(e.first_stmt(n))?t.merge_hash_set([i(e.first_stmt(n)),r(e.rest_stmts(n))]):e.is_while_statement(e.first_stmt(n))?t.merge_hash_set([u(e.first_stmt(n)),r(e.rest_stmts(n))]):e.is_for_statement(e.first_stmt(n))?t.merge_hash_set([f(e.first_stmt(n)),r(e.rest_stmts(n))]):e.is_var_definition(e.first_stmt(n))?t.merge_hash_set([h(e.first_stmt(n)),r(e.rest_stmts(n))]):r(e.rest_stmts(n))}function i(n){return t.merge_hash_set([s(e.if_consequent(n)),o(e.if_alternative(n))])}function s(e){return r(e)}function o(e){return r(e)}function u(t){return r(e.while_statements(t))}function a(e){return r(e)}function f(n){return t.merge_hash_set([l(e.for_initialiser(n)),c(e.for_statements(n))])}function l(n){return e.is_var_definition(n)?h(n):t.make_hash_set()}function c(e){return r(e)}function h(n){var r=t.make_hash_set({value:e.var_definition_variable(n),line:n.line||0});return r}return{search_defined_symbols:n}}),n("lib/compiler/nodecompiler",["lib/vm/instruction","lib/parser/nodes","lib/compiler/exception","lib/compiler/util","lib/compiler/instructionfactory","lib/compiler/pseudoinstruction","lib/compiler/searchsymbol"],function(e,t,n,r,i,s,o){"use strict";function a(){r.reset_temporary_variable_name_counter(),s.reset_address_label()}function f(e,t,n){for(var r=0,i=e.length;r<i;++r)s.is_break_marker(e[r])?e[r]=s.make_goto_label(t):s.is_continue_marker(e[r])&&(e[r]=s.make_goto_label(n))}function l(e,t){var n=o.search_defined_symbols(e);return r.merge_compile_result(n.map(function(e){return r.make_single_instruction(i.make_declare_symbol_instruction(e.value),e.line)}))}function c(e){return r.make_single_instruction(i.make_load_constant_value_instruction(e),undefined,!0,e)}function h(e){var n=t.variable_name(e);return r.make_single_instruction(i.make_load_symbol_instruction(n),t.stmt_line(e))}function p(e,n){var s=t.var_definition_variable(e),o=t.var_definition_value(e),u=B(o,n),a=t.stmt_line(e);return u.debug.length&&!u.debug[0].line&&(u.debug[0].line=a),r.merge_compile_result([u,r.make_single_instruction(i.make_store_symbol_instruction(s),a),r.make_single_instruction(i.make_load_constant_value_instruction())])}function d(e,n){var o=t.variable_name(t.assignment_variable(e)),a=t.assignment_value(e),f=B(a,n);f.debug.length&&!f.debug[0].line&&(f.debug[0].line=l);var l=t.stmt_line(e);return r.merge_compile_result([f,r.make_single_instruction(s.make_store_temporary_variable_label(u),l),r.make_single_instruction(s.make_load_temporary_variable_label(u)),r.make_single_instruction(i.make_store_symbol_instruction(o)),r.make_single_instruction(s.make_load_temporary_variable_label(u))])}function v(e,n){var i=t.if_predicate(e),o=B(i,n),u=s.make_address_label(),a=j.sequence.compile(t.if_consequent(e),n),f=j.sequence.compile(t.if_alternative(e),n),l=s.make_address_label();return r.merge_compile_result([o,r.make_single_instruction(s.make_false_goto_label(u)),a,r.make_single_instruction(s.make_goto_label(l)),r.make_single_instruction(u),f,r.make_single_instruction(l)])}function m(e,n){var i=t.ternary_predicate(e),o=B(i,n),u=s.make_address_label(),a=t.ternary_consequent(e),f=t.ternary_alternative(e),l=B(a,n),c=B(f,n),h=s.make_address_label();return r.merge_compile_result([o,r.make_single_instruction(s.make_false_goto_label(u)),l,r.make_single_instruction(s.make_goto_label(h)),r.make_single_instruction(u),c,r.make_single_instruction(h)])}function g(e,n){var i=s.make_address_label(),o=t.while_predicate(e),a=B(o,n),l=s.make_address_label(),c=j.sequence.compile(t.while_statements(e),n);return f(c.instructions,l,i),r.merge_compile_result([r.make_single_instruction(i),a,r.make_single_instruction(s.make_false_goto_label(l)),c,r.make_single_instruction(s.make_store_temporary_variable_label(u)),r.make_single_instruction(s.make_goto_label(i)),r.make_single_instruction(l),r.make_single_instruction(s.make_load_temporary_variable_label(u))])}function y(e,n){var i=t.for_initialiser(e),o=B(i,n),a=s.make_address_label(),l=t.for_predicate(e),c=B(l,n),h=s.make_address_label(),p=s.make_address_label(),d=j.sequence.compile(t.for_statements(e),n);f(d.instructions,h,p);var v=t.for_finaliser(e),m=B(v,n);return r.merge_compile_result([o,r.make_single_instruction(s.make_store_temporary_variable_label(u)),r.make_single_instruction(a),c,r.make_single_instruction(s.make_false_goto_label(h)),d,r.make_single_instruction(s.make_store_temporary_variable_label(u)),r.make_single_instruction(p),m,r.make_single_instruction(s.make_store_temporary_variable_label(u)),r.make_single_instruction(s.make_goto_label(a)),r.make_single_instruction(h),r.make_single_instruction(s.make_load_temporary_variable_label(u))])}function b(e){return r.make_single_instruction(s.make_break_marker(),t.stmt_line(e))}function w(e){return r.make_single_instruction(s.make_continue_marker(),t.stmt_line(e))}function E(e,n){if(t.empty_stmt(e))return r.merge_compile_result([r.make_single_instruction(i.make_load_constant_value_instruction(),t.stmt_line(e)),r.make_single_instruction(s.make_store_temporary_variable_label(u)),r.make_single_instruction(i.make_load_constant_value_instruction(),t.stmt_line(e))]);var o=[];while(!t.empty_stmt(e)){var a=t.first_stmt(e);e=t.rest_stmts(e),o.push(B(a,n),r.make_single_instruction(s.make_store_temporary_variable_label(u)))}return o.push(r.make_single_instruction(s.make_load_temporary_variable_label(u))),r.merge_compile_result(o)}function S(e,n){var i=t.operands(e),o=t.first_operand(i),a=t.first_operand(t.rest_stmts(i)),f=t.stmt_line(e),l=r.make_temporary_variable_name(),c=s.make_address_label(),h=s.make_address_label();return r.merge_compile_result([B(o,n),r.make_single_instruction(s.make_store_temporary_variable_label(l),f),r.make_single_instruction(s.make_load_temporary_variable_label(l)),r.make_single_instruction(s.make_false_goto_label(c)),B(a,n),r.make_single_instruction(s.make_goto_label(h)),r.make_single_instruction(c),r.make_single_instruction(s.make_load_temporary_variable_label(l),f),r.make_single_instruction(s.make_load_temporary_variable_label(l)),r.make_single_instruction(s.make_store_temporary_variable_label(u)),r.make_single_instruction(h)])}function x(e,n){var i=t.operands(e),o=t.first_operand(i),a=t.first_operand(t.rest_stmts(i)),f=[],l=s.make_address_label(),c=s.make_address_label(),h=r.make_temporary_variable_name();return r.merge_compile_result([B(o,n),r.make_single_instruction(s.make_store_temporary_variable_label(h),t.stmt_line(e)),r.make_single_instruction(s.make_load_temporary_variable_label(h)),r.make_single_instruction(s.make_false_goto_label(c)),r.make_single_instruction(s.make_load_temporary_variable_label(h)),r.make_single_instruction(s.make_load_temporary_variable_label(h)),r.make_single_instruction(s.make_store_temporary_variable_label(u)),r.make_single_instruction(s.make_goto_label(l)),r.make_single_instruction(c),B(a,n),r.make_single_instruction(l)])}function T(e,n){switch(t.operator(e)){case"&&":return S(e,n);case"||":return x(e,n);default:throw new r.CompileError("Unexpected boolean operation operator")}}function N(e,o){function a(e){return o.substring(e.start_offset,e.end_offset)}var f=t.function_definition_text_location(e),c=r.make_function_description(t.function_definition_name(e),a(f));for(var h=t.function_definition_parameters(e);!t.no_operands(h);h=t.rest_operands(h)){var p=t.first_operand(h);c.parameters.push(p)}var d=s.make_address_label(),v=t.function_definition_body(e),m=j.sequence.compile(v,o),g=l(v,o);c.compile_result=r.merge_compile_result([r.make_single_instruction(d),g,m,r.make_single_instruction(i.make_load_constant_value_instruction()),r.make_single_instruction(s.make_store_temporary_variable_label(u)),r.make_single_instruction(i.make_load_constant_value_instruction()),r.make_single_instruction(s.make_return_label())]);var y=r.make_single_instruction(s.make_function_load_label(d,c),t.stmt_line(e));return y.parsed_functions.push(c),g.instructions.forEach(function(e,t){if(c.parameters.indexOf(e.value)>-1)throw new n.ClosureFormalRedeclarationException(e.value,g.debug[t].line)}),y}function k(e,n){var o=t.operands(e),u,a,f,l,c=t.is_variable(t.operator(e))&&C.hasOwnProperty(t.variable_name(t.operator(e))),h=t.stmt_line(e);if(c){var p=t.variable_name(t.operator(e));return p==="+"&&t.no_operands(t.rest_operands(o))?B(t.first_operand(o),n):p==="-"&&t.no_operands(t.rest_operands(o))?r.merge_compile_result([B(t.first_operand(o),n),r.make_single_instruction(C["arithmetic-negation"],h)]):p==="!"?r.merge_compile_result([B(t.first_operand(o),n),r.make_single_instruction(C["!"],h)]):r.merge_compile_result([B(t.first_operand(o),n),B(t.first_operand(t.rest_operands(o)),n),r.make_single_instruction(C[p],h)])}var d=t.operator(e),v=[B(d,n),r.make_single_instruction(i.make_load_constant_value_instruction(),h)],m;for(o=t.operands(e),m=1;!t.no_operands(o);o=t.rest_operands(o),++m)u=t.first_operand(o),v.push(B(u,n));return v.push(r.make_single_instruction(s.make_call_label(m))),r.merge_compile_result(v)}function L(e,n){var i=t.return_statement_expression(e);return r.merge_compile_result([B(i,n),r.make_single_instruction(s.make_return_label(),t.stmt_line(e))])}function A(e,n){var o=t.object(e),a=r.make_temporary_variable_name(),f=t.object_property(e),l=t.stmt_line(e),c=[B(o,n),r.make_single_instruction(s.make_store_temporary_variable_label(a),l),r.make_single_instruction(s.make_load_temporary_variable_label(a)),B(f,n),r.make_single_instruction(i.make_read_object_property_instruction(),l),r.make_single_instruction(s.make_load_temporary_variable_label(a))],h,p;for(p=t.operands(e),h=1;!t.no_operands(p);p=t.rest_operands(p),++h){var d=t.first_operand(p);c.push(B(d,n))}return c.push(r.make_single_instruction(s.make_call_label(h),l),r.make_single_instruction(s.make_store_temporary_variable_label(u)),r.make_single_instruction(s.make_load_temporary_variable_label(u))),r.merge_compile_result(c)}function O(e,n){var o,a,f=[];for(o=t.object_expression_pairs(e),a=0;!t.empty_object_expression_pairs(o);o=t.rest_object_expression_pairs(o),++a){var l=t.first_object_expression_pair(o),c=t.object_expression_pair_key(l),h=t.object_expression_pair_value(l);f.push(B(h,n),r.make_single_instruction(i.make_load_constant_value_instruction(c),t.stmt_line(l)))}return f.push(r.make_single_instruction(i.make_load_literal_object_instruction(a),t.stmt_line(e)),r.make_single_instruction(s.make_store_temporary_variable_label(u)),r.make_single_instruction(s.make_load_temporary_variable_label(u))),r.merge_compile_result(f)}function M(e){var n=[];return n.push(r.make_single_instruction(i.make_load_literal_array_instruction(0),t.stmt_line(e)),r.make_single_instruction(s.make_store_temporary_variable_label(u)),r.make_single_instruction(s.make_load_temporary_variable_label(u))),r.merge_compile_result(n)}function _(e,n){var o,a,f=[];for(o=t.array_expression_elements(e),a=0;!t.empty_array_element(o);o=t.rest_array_elements(o),++a){var l=t.first_array_element(o);f.push(B(l,n))}return f.push(r.make_single_instruction(i.make_load_literal_array_instruction(a),t.stmt_line(e)),r.make_single_instruction(s.make_store_temporary_variable_label(u)),r.make_single_instruction(s.make_load_temporary_variable_label(u))),r.merge_compile_result(f)}function D(e,n){var o=r.make_temporary_variable_name(),a=t.stmt_line(e),f=[r.make_single_instruction(i.make_load_symbol_instruction(t.construction_type(e)),a),r.make_single_instruction(i.make_load_literal_object_instruction(0))],l,c;for(l=t.operands(e),c=1;!t.no_operands(l);l=t.rest_operands(l),++c){var h=t.first_operand(l);f.push(B(h,n))}return f.push(r.make_single_instruction(i.make_construction_call_instruction(c),a),r.make_single_instruction(s.make_store_temporary_variable_label(u)),r.make_single_instruction(s.make_load_temporary_variable_label(u))),r.merge_compile_result(f)}function P(e,n){var o=t.property_access_object(e),a=t.property_access_property(e),f=[B(o,n),B(a,n)];return f.push(r.make_single_instruction(i.make_read_object_property_instruction(),t.stmt_line(e)),r.make_single_instruction(s.make_store_temporary_variable_label(u)),r.make_single_instruction(s.make_load_temporary_variable_label(u))),r.merge_compile_result(f)}function H(e,n){var o=t.property_assignment_object(e),a=t.property_assignment_property(e),f=t.property_assignment_value(e),l=r.make_temporary_variable_name();return r.merge_compile_result([B(o,n),B(a,n),B(f,n),r.make_single_instruction(s.make_store_temporary_variable_label(u)),r.make_single_instruction(s.make_load_temporary_variable_label(u)),r.make_single_instruction(i.make_store_object_property_instruction(),t.stmt_line(e)),r.make_single_instruction(s.make_load_temporary_variable_label(u))])}function B(e,t){for(var n=0,i=F.length;n<i;++n){var s=j[F[n]];if(s.is(e))return s.compile(e,t)}throw new r.CompileError("Unexpected statement type",e)}function I(e,t){return r.merge_compile_result([l(e,t),E(e,t),r.make_single_instruction(i.make_done_instruction())])}var u=":$",C={"+":new e("PLUS"),"-":new e("SUB"),"*":new e("TIMES"),"/":new e("DIV"),"%":new e("MOD"),">=":new e("GREATERTHANEQ"),"<=":new e("LESSTHANEQ"),">":new e("GREATERTHAN"),"<":new e("LESSTHAN"),"===":new e("EQUAL"),"!==":new e("NOTEQUAL"),"!":new e("BNEG"),"arithmetic-negation":new e("ANEG")},j={"self-evaluating":{is:t.is_self_evaluating,compile:c},variable:{is:t.is_variable,compile:h},"var-definition":{is:t.is_var_definition,compile:p},assignment:{is:t.is_assignment,compile:d},"if":{is:t.is_if_statement,compile:v},ternary:{is:t.is_ternary_statement,compile:m},"while":{is:t.is_while_statement,compile:g},"for":{is:t.is_for_statement,compile:y},"break":{is:t.is_break_statement,compile:b},"continue":{is:t.is_continue_statement,compile:w},"function-definition":{is:t.is_function_definition,compile:N},sequence:{is:t.is_sequence,compile:E},"boolean-op":{is:t.is_boolean_operation,compile:T},application:{is:t.is_application,compile:k},"return":{is:t.is_return_statement,compile:L},"object-expression":{is:t.is_object_expression,compile:O},"object-method":{is:t.is_object_method_application,compile:A},"empty-list":{is:t.is_empty_list_statement,compile:M},"array-expression":{is:t.is_array_expression,compile:_},construction:{is:t.is_construction,compile:D},"property-access":{is:t.is_property_access,compile:P},"property-assignment":{is:t.is_property_assignment,compile:H}},F=Object.getOwnPropertyNames(j);return{compile_main:I,compile_any_expression:B,reset_all_counters:a}}),n("lib/compiler/preprocess",["lib/parser/nodes","lib/compiler/util"],function(e,t){function n(){return{loop_controls:[],returns:[]}}function r(e){var t=n();for(var r=0,i=e.length;r<i;++r)Array.prototype.push.apply(t.loop_controls,e[r].loop_controls),Array.prototype.push.apply(t.returns,e[r].returns);return t}function i(r){if(e.variable_name(r)==="__proto__")throw new t.CompileError("Unexpected token __proto__",e.stmt_line(r));return n()}function s(n){if(e.var_definition_variable(n)==="this")throw new t.CompileError("Unexpected token this",e.stmt_line(n));if(e.variable_name(n)==="__proto__")throw new t.CompileError("Unexpected token __proto__",e.stmt_line(n));return T(e.var_definition_value(n))}function o(n){i(e.assignment_variable(n));if(e.variable_name(n)==="__proto__")throw new t.CompileError("Unexpected token __proto__",e.stmt_line(n));return T(e.assignment_value(n))}function u(t){return r([T(e.if_predicate(t)),T(e.if_consequent(t)),T(e.if_alternative(t))])}function a(t){return r([T(e.ternary_predicate(t)),T(e.ternary_consequent(t)),T(e.ternary_alternative(t))])}function f(t){var n=r([T(e.while_predicate(t)),v(e.while_statements(t))]);return n.loop_controls.length=0,n}function l(t){var n=r([T(e.for_initialiser(t)),T(e.for_predicate(t)),T(e.for_statements(t)),T(e.for_finaliser(t))]);return n.loop_controls.length=0,n}function c(t){var r=n();return r.loop_controls.push(e.stmt_line(t)),r}function h(t){var r=n();return r.loop_controls.push(e.stmt_line(t)),r}function p(r){var i=v(e.function_definition_body(r));if(i.loop_controls.length)throw new t.CompileError("Invalid loop controls",i.loop_controls);for(var s=e.function_definition_parameters(r);!e.no_operands(s);s=e.rest_operands(s)){if(e.first_operand(s)==="this")throw new t.CompileError("Unexpected token this",e.stmt_line(r));if(e.first_operand(s)==="__proto__")throw new t.CompileError("Unexpected token __proto__",e.stmt_line(r))}return n()}function d(t){return T(e.return_statement_expression(t))}function v(t){var n=[];while(!e.empty_stmt(t))n.push(T(e.first_stmt(t))),t=e.rest_stmts(t);return r(n)}function m(t){var n=e.operands(t);return r([T(e.first_operand(n)),T(e.first_operand(e.rest_operands(n)))])}function g(t){var n=[T(e.operator(t))];for(var i=e.operands(t);!e.no_operands(i);i=e.rest_operands(i))n.push(T(e.first_operand(i)));return r(n)}function y(t){var n=[];for(var i=e.object_expression_pairs(t);!e.empty_object_expression_pairs(i);i=e.rest_object_expression_pairs(i))n.push(T(e.object_expression_pair_value(e.first_object_expression_pair(i))));return r(n)}function b(t){var n=[T(e.object(t)),T(e.object_property(t))];for(var i=e.operands(t);!e.no_operands(i);i=e.rest_operands(i))n.push(T(e.first_operand(i)));return r(n)}function w(t){var n=[];for(var i=e.array_expression_elements(t);!e.empty_array_element(i);i=e.rest_array_elements(i))n.push(T(e.first_array_element(i)));return r(n)}function E(n){var i=[];if(e.construction_type(n)==="__proto__")throw new t.CompileError("Unexpected token __proto__",e.stmt_line(n));for(var s=e.operands(n);!e.no_operands(s);s=e.rest_operands(s))i.push(T(e.first_operand(s)));return r(i)}function S(t){return r([T(e.property_access_object(t)),T(e.property_access_property(t))])}function x(t){return r([T(e.property_assignment_object(t)),T(e.property_assignment_property(t)),T(e.property_assignment_value(t))])}function T(r){if(e.is_self_evaluating(r))return n();if(e.is_variable(r))return i(r);if(e.is_var_definition(r))return s(r);if(e.is_assignment(r))return o(r);if(e.is_if_statement(r))return u(r);if(e.is_ternary_statement(r))return a(r);if(e.is_while_statement(r))return f(r);if(e.is_for_statement(r))return l(r);if(e.is_break_statement(r))return c(r);if(e.is_continue_statement(r))return h(r);if(e.is_function_definition(r))return p(r);if(e.is_sequence(r))return v(r);if(e.is_boolean_operation(r))return m(r);if(e.is_application(r))return g(r);if(e.is_return_statement(r))return d(r);if(e.is_object_expression(r))return y(r);if(e.is_object_method_application(r))return b(r);if(e.is_array_expression(r))return w(r);if(e.is_construction(r))return E(r);if(e.is_property_access(r))return S(r);if(e.is_property_assignment(r))return x(r);if(e.is_empty_list_statement(r))return!0;throw new t.CompileError("Unexpected statement type",r)}function N(e){var n=v(e);if(n.loop_controls.length)throw new t.CompileError("Invalid loop controls",n.loop_controls);if(n.returns.length)throw new t.CompileError("Returns are not allowed at top level",n.returns)}return{check_semantics:N}}),n("lib/compiler/postprocess",["lib/compiler/util","lib/compiler/nodecompiler","lib/compiler/instructionfactory","lib/compiler/pseudoinstruction"],function(e,t,n,r){function i(t){function d(e,t,o){var u=i[r.label_name(t)],a=s[u]-s[o];e.push(n.make_goto_instruction(u-o-a))}function v(e,t,o){var u=i[r.label_name(t)],a=s[u]-s[o];e.push(n.make_goto_on_false_instruction(u-o-a))}function m(e,t){e.push(n.make_return_instruction())}function g(e,t){var o=r.label_name(t),u=i[o],a=s[u],f=r.function_load_label_description(t),l=f.source;e.push(n.make_load_function_instruction([u-a].concat(f.parameters),l))}function y(e,s,o){var u=o+1;while(u<a){var f=t.instructions[u];if(!r.is_goto_label(f)&&!r.is_address_label(f))break;u=i[r.label_name(f)]}r.is_return_label(t.instructions[u])?e.push(n.make_tail_call_instruction(r.call_label_argument_length(s))):e.push(n.make_call_instruction(r.call_label_argument_length(s)))}function b(e,t){e.push(n.make_load_symbol_instruction(r.label_name(E)))}function w(e,t){e.push(n.make_store_symbol_instruction(r.label_name(E)))}var i={},s=[],o=e.make_hash_set(),u,a;for(u=0,a=t.instructions.length;u<a;++u)(r.is_store_temporary_variable_label(t.instructions[u])||r.is_load_temporary_variable_label(t.instructions[u]))&&e.add_to_hash_set(o,r.label_name(t.instructions[u]));t.debug=o.values.map(function(){return e.make_debug_info(0)}).concat(t.debug),t.instructions=o.values.map(n.make_declare_symbol_instruction).concat(t.instructions),u=0,a=t.instructions.length;var f=0;while(u<a){if(r.is_address_label(t.instructions[u])){var l=[];while(u<a&&r.is_address_label(t.instructions[u]))l.push(r.label_name(t.instructions[u])),s.push(++f),++u;for(var c=0;c<l.length;++c)i[l[c]]=u}s.push(f),++u}var h=[],p=[];for(u=0,a=t.instructions.length;u<a;++u){var E=t.instructions[u];if(r.is_address_label(E))continue;r.is_goto_label(E)?d(h,E,u):r.is_false_goto_label(E)?v(h,E,u):r.is_call_label(E)?y(h,E,u):r.is_return_label(E)?m(h,u):r.is_function_load_label(E)?g(h,E):r.is_load_temporary_variable_label(E)?b(h,E):r.is_store_temporary_variable_label(E)?w(h,E):h.push(E),p.push(t.debug[u])}return{instructions:h,debug:p}}return{post_process:i}}),n("lib/compiler/compiler",["lib/compiler/util","lib/compiler/nodecompiler","lib/compiler/preprocess","lib/compiler/postprocess"],function(e,t,n,r){"use strict";function i(i,s){function f(e){e.function_name=a.name}t.reset_all_counters(),n.check_semantics(i);var o=[t.compile_main(i,s)],u=[];Array.prototype.push.apply(u,o[0].parsed_functions);var a;while(u.length)a=u.shift(),a.compile_result.debug.forEach(f),o.push(a.compile_result),Array.prototype.push.apply(u,a.compile_result.parsed_functions),a.compile_result.parsed_functions.length=0;var l=e.merge_compile_result(o);l.debug[0].line===undefined&&(l.debug[0].line=0);for(var c=1,h=l.debug.length;c<h;++c)l.debug[c].line===undefined&&(l.debug[c].line=l.debug[c-1].line);return r.post_process(l)}return i}),n("lib/vm/exception",[],function(){"use strict";return{InstructionNotFound:function(e){this.message=e+" does not exist in the instruction"+" library"},OperandStackIndexOutOfBounds:function(){this.message="Operand stack index out of bounds"},EmptyOperandStack:function(){this.message="Popping from empty operand stack."},WrongNumberOfArguments:function(e,t){this.message="Wrong number of arguments supplied.\n",this.message+=t-1+" needed, "+(e-1)+" given."},TypeError:function(e,t,n){this.message="An expression does not conform to the official Source language specification\n",n?this.message+="Expected "+n+" operand of type "+e+" but get "+t:this.message+="Expected expression of type "+e+" but get "+t},MaximumCallStackSizeExceeded:function(){this.message="Maximum call stack size exceeded"},UnboundVariable:function(e){this.message="Unbound variable: "+e}}}),n("lib/vm/internal/operandStack",["lib/vm/exception"],function(e){"use strict";function t(){this.stack=[]}return t.prototype.top=function(){return this.at(0)},t.prototype.at=function(t){if(this.stack.length<=0)throw new e.EmptyOperandStack;var n=this.stack.length-1-t;if(t<0||n<0)throw new e.OperandStackIndexOutOfBounds;return this.stack[n]},t.prototype.push=function(e){this.stack.push(e)},t.prototype.pop=function(){if(this.stack.length===0)throw new e.EmptyOperandStack;return this.stack.pop()},t.prototype.to_transferable_object=function(){return this.stack},t.prototype.clone_transferable_object=function(e){this.stack=e},t}),n("lib/vm/internal/closure",[],function(){"use strict";function e(e,t,n,r){this.address=e,this.formals=t,this.environment=n,this.is_native=!1,this.is_external=!1,this.source=r}function t(e){var t="",n;for(n=1;n<e.length;n++)n===e.length-1?t+=e[n]:t=t+e[n]+", ";return t}return e.prototype.toString=function(){return this.is_native?this.code_string:"function("+t(this.formals)+") { [body] }"},e}),n("lib/vm/internal/environment",["lib/vm/exception","lib/vm/internal/closure"],function(e,t){"use strict";function n(e){this.parent=e,this.__env={},this.is_closure_formals=!1}return n.prototype.get=function(t){var n=this;while(n!==null){if(n.__env.hasOwnProperty(t))return n.__env[t];n=n.parent}throw new e.UnboundVariable(t)},n.prototype.add=function(e,t){this.__env[e]=t},n.prototype.update=function(t,n){var r=this;while(r!==null){if(r.__env.hasOwnProperty(t)){r.__env[t]=n;return}r=r.parent}throw new e.UnboundVariable(t)},n.prototype.chain_update=function(t,n){var r=this.get(t[0]),i=t[t.length-1],s;for(s=1;s<t.length-1;++s){r=r[t[s]];if(r===undefined)throw new e.UnboundVariable(t[s])}if(r[i]===undefined)throw new e.UnboundVariable(i);r[i]=n},n.is_closure=function(e){return e instanceof t},n.is_object=function(e){return typeof e==typeof {}},n.prototype.to_transferable_object=function(){return this.__env},n.prototype.clone_transferable_object=function(e){this.__env=e},n}),n("lib/vm/ffi",["require","lib/vm/internal/closure","lib/vm/internal/operandStack","lib/vm/instruction"],function(e){"use strict";function i(e,t){return e[t]}function s(e,n){e.push(n);var r=new t(e.length-1);return r.code_string=n+"",r.is_native=!0,r.is_external=!1,r}function o(e,t){var n=s(e,t);return n.is_external=!0,n}function u(e,t){return function(){var i=arguments.length,s=e.pc,o=e.operand_stack;e.operand_stack=new n,e.operand_stack.push(t);var u;for(u=0;u<i;u++)e.operand_stack.push(arguments[u]);e.instruction_array.push(new r("CALL",i));var a=e.execute_instruction(e.instruction_array,e.instruction_array.length-1);return e.instruction_array.pop(),e.operand_stack=o,e.pc=s,a.value}}function a(e,t){var i=function(){var i=arguments.length+1,s=e.pc,o=e.operand_stack;e.operand_stack=new n,e.operand_stack.push(t),e.operand_stack.push(this);var u;for(u=0;u<i-1;u++)e.operand_stack.push(arguments[u]);e.instruction_array.push(new r("CALL",i));var a=e.execute_instruction(e.instruction_array,e.instruction_array.length-1);return e.instruction_array.pop(),e.operand_stack=o,e.pc=s,a.value};return i.call=u(e,t),i.__as_closure__=t,i.toString=function(){return e.stringify_value(t)},i}function f(e,t){return typeof t!="object"||t===null||t===undefined||t.__NATIVE_OBJECT__!==undefined?t:(t.hasOwnProperty("__METHODS__")&&t.__METHODS__.forEach(function(n){t.hasOwnProperty(n)&&(t[n]=l(e,t[n]))}),t.__proto__=f(e,t.__proto__),t)}function l(e,n){if(n instanceof t&&!n.is_native)return n.mock;if(n instanceof t&&n.is_native)return e.ffi_register[n.address];if(n instanceof Array)return n;switch(typeof n){case"number":case"string":case"boolean":case"function":return n;case"object":return f(e,n);default:return n}}var t=e("lib/vm/internal/closure"),n=e("lib/vm/internal/operandStack"),r=e("lib/vm/instruction");return{wrap_to_vm_call:a,get_function:i,vm_value_to_javascript:l,get_closure:function(e,t){var n=i(e,t.address);return n?n.__as_closure__:undefined},import_dom_modifying_function:function(e,t){var n=[];return t.forEach(function(t){var r=window[t];if(typeof r=="function"){var i=o(n,r);e.environment[t]=i}else e.environment[t]=r}),n},import_non_dom_modifying_function:function(e,t,n){var r=[];return t.forEach(function(t){var i;e.is_inside_web_worker?i=self[t]:i=n[t];if(typeof i=="function"){var o=s(r,i);e.environment.add(t,o)}else typeof i=="object"?(i.__NATIVE_OBJECT__=!0,e.environment.add(t,i)):e.environment.add(t,i)}),r},call:function(e,t,n,r){r=r||!1;var s=i(n,e);return this.call_wo_register(s,t,n,r)},call_wo_register:function(e,n,r,u){var a=n[0];Array.prototype.shift.apply(n);var f=e.apply(a,n.map(function(e){return e instanceof t?i(r,e.address):e}));return typeof f=="function"?u?o(r,f):s(r,f):f},construct_foreign_object:function(e,n,r){var u={},a=i(r,e.address);u.constructor=a,u.__proto__=a.prototype,Array.prototype.shift.apply(n);var f=a.apply(u,n.map(function(e){return e instanceof t?i(r,e.address):e}));return f===undefined?u:typeof f=="function"?is_external_call?o(r,f):s(r,f):f}}}),n("lib/messageLibrary",[],function(){return{VM:{Request:{CREATE_INSTANCE:"create instance",EXECUTE_INSTRUCTION:"execute instruction",SET_INSTANCE:"set instance",RESUME_EXECUTION:"resume execution",GET_RUNTIME_INFORMATION:"get runtime information"},Response:{MODULE_LOADED:"module loaded",INSTANCE_CREATED:"instance created",INSTANCE_UNDEFINED:"instance undefined",INSTANCE_SET:"instance set",EXECUTION_FINISHED:"execution finished",EXECUTION_FAILED:"execution failed",EXECUTION_SUSPENDED:"execution suspended",RUNTIME_INFORMATION:"runtime information"}},Main:{Request:{FFI_CALL:"ffi call"},Response:{FFI_CALL_DONE:"ffi call done"}}}}),n("lib/vm/internal/stackFrame",[],function(){"use strict";function e(e,t,n,r){this.pc=e,this.environment=t,this.operand_stack=n,this.is_object_construction=r||!1}return e.prototype.to_transferable_object=function(){return{pc:this.pc,environment:this.environment.to_transferable_object(),operand_stack:this.operand_stack.to_transferable_object(),is_object_construction:this.is_object_construction}},e}),n("lib/vm/instructionData",["require","lib/messageLibrary","lib/vm/ffi","lib/vm/exception","lib/vm/internal/environment","lib/vm/internal/closure","lib/vm/internal/stackFrame","lib/vm/internal/operandStack","lib/vm/instruction"],function(e){"use strict";function c(e){return e instanceof s?"function":typeof e}function h(e,t,a){var l=e.operand_stack.at(t),c=0,h,p,d=!(l instanceof s);d&&l.__as_closure__ instanceof s&&(l=l.__as_closure__,d=!1);if(!d&&!l.is_native){if(t!=l.formals.length)throw new r.WrongNumberOfArguments(t,l.formals.length);var v=new i(l.environment);while(c<t)h=e.operand_stack.pop(),p=l.formals[t-c-1],v.add(p,h),c++;e.operand_stack.pop();if(!a){if(e.runtime_stack.length>f)throw e.runtime_stack=[],new r.MaximumCallStackSizeExceeded;e.runtime_stack.push(new o(e.pc,e.environment,e.operand_stack))}e.pc=l.address,e.operand_stack=new u,e.environment=v}else{var m=[];while(c<t)m.push(e.operand_stack.pop()),c++;m=m.reverse().map(function(t){return n.vm_value_to_javascript(e,t)});if(l.is_external&&e.is_inside_web_worker)return e.suspend_for_ffi(l.address,m);var g;d?g=n.call_wo_register(l,m,e.ffi_register):g=n.call(l.address,m,e.ffi_register),e.operand_stack.pop(),e.operand_stack.push(g),e.pc++}}var t=e("lib/messageLibrary"),n=e("lib/vm/ffi"),r=e("lib/vm/exception"),i=e("lib/vm/internal/environment"),s=e("lib/vm/internal/closure"),o=e("lib/vm/internal/stackFrame"),u=e("lib/vm/internal/operandStack"),a=e("lib/vm/instruction"),f=65536,l={NUMBER:"number",STRING:"string",BOOLEAN:"boolean",FUNCTION:"function",OBJECT:"object"};return{LDU:{param:0,execute:function(e){e.operand_stack.push(undefined),e.pc++}},LDCN:{param:1,execute:function(e,t){e.operand_stack.push(t),e.pc++}},LDCS:{param:1,execute:function(e,t){e.operand_stack.push(t),e.pc++}},LDCB:{param:1,execute:function(e,t){e.operand_stack.push(t),e.pc++}},PLUS:{param:0,execute:function(e){var t=e.operand_stack.pop(),n=e.operand_stack.pop();if(c(n)!==l.NUMBER&&c(n)!==l.STRING&&c(t)!==l.NUMBER&&c(t)!==l.STRING)throw new r.TypeError(l.NUMBER+" or "+l.STRING,c(n),"left");e.operand_stack.push(n+t),e.pc++}},SUB:{param:0,execute:function(e){var t=e.operand_stack.pop(),n=e.operand_stack.pop();if(c(n)!==l.NUMBER)throw new r.TypeError(l.NUMBER,c(n),"left");if(c(t)!==l.NUMBER)throw new r.TypeError(l.NUMBER,c(t),"right");e.operand_stack.push(n-t),e.pc++}},TIMES:{param:0,execute:function(e){var t=e.operand_stack.pop(),n=e.operand_stack.pop();if(c(n)!==l.NUMBER)throw new r.TypeError(l.NUMBER,c(n),"left");if(c(t)!==l.NUMBER)throw new r.TypeError(l.NUMBER,c(t),"right");e.operand_stack.push(n*t),e.pc++}},DIV:{param:0,execute:function(e){var t=e.operand_stack.pop(),n=e.operand_stack.pop();if(c(n)!==l.NUMBER)throw new r.TypeError(l.NUMBER,c(n),"left");if(c(t)!==l.NUMBER)throw new r.TypeError(l.NUMBER,c(t),"right");e.operand_stack.push(n/t),e.pc++}},MOD:{param:0,execute:function(e){var t=e.operand_stack.pop(),n=e.operand_stack.pop();if(c(n)!==l.NUMBER)throw new r.TypeError(l.NUMBER,c(n),"left");if(c(t)!==l.NUMBER)throw new r.TypeError(l.NUMBER,c(t),"right");e.operand_stack.push(n%t),e.pc++}},EQUAL:{param:0,execute:function(e){var t,i=e.operand_stack.pop(),o=e.operand_stack.pop();if(c(o)!=="undefined"&&c(i)!=="undefined"&&c(o)!==c(i))throw new r.TypeError(c(o),c(i),"right");o instanceof s&&i instanceof s&&i.is_native?t=o===i||n.get_closure(e.ffi_register,i)===o:i instanceof s&&o instanceof s&&o.is_native?t=o===i||n.get_closure(e.ffi_register,o)===i:o instanceof s&&typeof i=="function"?t=o===i.__as_closure__:i instanceof s&&typeof o=="function"?t=i===o.__as_closure__:t=o===i,e.operand_stack.push(t),e.pc++}},NOTEQUAL:{param:0,execute:function(e){var t=e.operand_stack.pop(),n=e.operand_stack.pop();if(c(n)!==c(t))throw new r.TypeError(c(n),c(t),"right");e.operand_stack.push(n!==t),e.pc++}},ANEG:{param:0,execute:function(e){var t=e.operand_stack.pop();if(c(t)!==l.NUMBER)throw new r.TypeError(l.NUMBER,c(t));e.operand_stack.push(-t),e.pc++}},BNEG:{param:0,execute:function(e){var t=e.operand_stack.pop();if(c(t)!==l.BOOLEAN)throw new r.TypeError(l.BOOLEAN,c(t));e.operand_stack.push(!t),e.pc++}},LESSTHAN:{param:0,execute:function(e){var t=e.operand_stack.pop(),n=e.operand_stack.pop();if(c(n)!==l.NUMBER)throw new r.TypeError(l.NUMBER,c(n),"left");if(c(t)!==l.NUMBER)throw new r.TypeError(l.NUMBER,c(t),"right");e.operand_stack.push(n<t),e.pc++}},LESSTHANEQ:{param:0,execute:function(e){var t=e.operand_stack.pop(),n=e.operand_stack.pop();if(c(n)!==l.NUMBER)throw new r.TypeError(l.NUMBER,c(n),"left");if(c(t)!==l.NUMBER)throw new r.TypeError(l.NUMBER,c(t),"right");e.operand_stack.push(n<=t),e.pc++}},GREATERTHAN:{param:0,execute:function(e){var t=e.operand_stack.pop(),n=e.operand_stack.pop();if(c(n)!==l.NUMBER)throw new r.TypeError(l.NUMBER,c(n),"left");if(c(t)!==l.NUMBER)throw new r.TypeError(l.NUMBER,c(t),"right");e.operand_stack.push(n>t),e.pc++}},GREATERTHANEQ:{param:0,execute:function(e){var t=e.operand_stack.pop(),n=e.operand_stack.pop();if(c(n)!==l.NUMBER)throw new r.TypeError(l.NUMBER,c(n),"left");if(c(t)!==l.NUMBER)throw new r.TypeError(l.NUMBER,c(t),"right");e.operand_stack.push(n>=t),e.pc++}},JOFR:{param:1,execute:function(e,t){var n=e.operand_stack.pop();if(c(n)!==l.BOOLEAN)throw new r.TypeError(l.BOOLEAN,c(n));e.pc=n?e.pc+1:e.pc+t}},GOTOR:{param:1,execute:function(e,t){e.pc=e.pc+t}},LDS:{param:1,execute:function(e,t){e.operand_stack.push(e.environment.get(t)),e.pc++}},DECLARE:{param:1,execute:function(e,t){var n=e.environment.parent;e.environment.add(t,undefined),e.pc++}},LDF:{param:1,execute:function(e,t,r){var o=t[0],u=t.slice(1),a=new i(e.environment);a.is_closure_formals=!0,u.forEach(function(e){a.add(e,undefined)});var f=new s(o,u,a,r);f.mock=n.wrap_to_vm_call(e,f),e.operand_stack.push(f),e.pc++}},CALL:{param:1,execute:function(e,t){return h(e,t,!1)}},TAILCALL:{param:1,execute:function(e,t){return h(e,t,!0)}},CONSTRUCT:{param:1,execute:function(e,t){var r=e.operand_stack.at(t),a=0,f,l,c={};if(r instanceof s&&!r.is_native){a=0;var h=new i(r.environment);while(a<t)f=e.operand_stack.pop(),l=r.formals[t-a-1],h.add(l,f),a++;e.operand_stack.pop(),e.runtime_stack.push(new o(e.pc,e.environment,e.operand_stack,!0)),c.__proto__=r.mock.prototype,h.update("this",c),e.pc=r.address,e.operand_stack=new u,e.environment=h}else{var p=[];while(a<t)p.push(e.operand_stack.pop()),a++;p=p.reverse().map(function(t){return n.vm_value_to_javascript(e,t)}),c=n.construct_foreign_object(r,p,e.ffi_register),e.operand_stack.pop(),e.operand_stack.push(c),e.pc++}}},RTN:{param:0,execute:function(e){var t=e.operand_stack.pop(),n=e.runtime_stack.pop();n.is_object_construction&&t===undefined&&(t=e.environment.get("this")),e.pc=n.pc,e.environment=n.environment,e.operand_stack=n.operand_stack,e.operand_stack.push(t),e.pc++}},POP:{param:0,execute:function(e){e.operand_stack.pop(),e.pc++}},LDCO:{param:1,execute:function(e,t){var n={},r,i,o;for(r=1;r<=t;r++)i=e.operand_stack.pop(),o=e.operand_stack.pop(),n[i]=o,o instanceof s&&(n.__METHODS__=n.__METHODS__||[],n.__METHODS__.push(i));e.operand_stack.push(n),e.pc++}},LDCA:{param:1,execute:function(e,t){var n=[];for(var r=0;r<t;r++)n.push(e.operand_stack.pop());n.reverse(),e.operand_stack.push(n),e.pc++}},READPS:{param:0,execute:function(e){var t=e.operand_stack.pop(),r=e.operand_stack.pop(),i;r instanceof s?r.is_native?(i=n.get_function(e.ffi_register,r.address),i=i[t]):i=r.mock[t]:i=r[t],e.operand_stack.push(i),e.pc++}},STOREPS:{param:0,execute:function(e){var t=e.operand_stack.pop(),r=e.operand_stack.pop(),i=e.operand_stack.pop();i instanceof s?i.is_native?n.get_function(i.address,e.ffi_register)[r]=t:i.mock[r]=t:(i[r]=t,t instanceof s&&(i.__METHODS__=i.__METHODS__||[],i.__METHODS__.push(r))),e.pc++}},STORE:{param:1,execute:function(e,t){var n=e.operand_stack.pop();t!=="undefined"&&e.environment.update(t,n),e.pc++}},DONE:{param:0}}}),n("lib/vm/runtime",["require","lib/vm/exception","lib/vm/internal/operandStack","lib/vm/internal/environment","lib/vm/internal/closure","lib/vm/ffi","lib/vm/instructionData","lib/messageLibrary"],function(e){"use strict";function a(e,t){t=t||self,this.instruction_array=[],this.runtime_stack=[],this.operand_stack=new n,this.environment=new r(null),this.pc=0,this.is_inside_web_worker=typeof WorkerGlobalScope!="undefined"&&self instanceof WorkerGlobalScope,e!==undefined?this.ffi_register=s.import_non_dom_modifying_function(this,e,t):this.ffi_register=[]}function f(e){return e.replace(/\[native code\]/i,"[body]")}function l(e){return e.replace(/(function .*\(.*\)).*$/m,"$1 { [body] }").split("\n")[0]}var t=e("lib/vm/exception"),n=e("lib/vm/internal/operandStack"),r=e("lib/vm/internal/environment"),i=e("lib/vm/internal/closure"),s=e("lib/vm/ffi"),o=e("lib/vm/instructionData"),u=e("lib/messageLibrary");return a.prototype.execute_instruction=function(e,n,r,i){r===undefined&&(r={}),this.pc=n||0,this.instruction_array=e;var s;while(this.pc<e.length&&e[this.pc].name!=="DONE"){s=e[this.pc];var a=o[s.name],f=+(new Date);if(f>=i)throw new Error("Timeout limit exceeded");if(a===undefined)throw new t.InstructionNotFound(s.name);var l=a.execute(this,s.value,s.source);if(typeof l=="object")return l;if(r[this.pc])return{status:u.VM.Response.EXECUTION_SUSPENDED}}return{status:u.VM.Response.EXECUTION_FINISHED,value:this.operand_stack.top()}},a.prototype.execute_more_instruction=function(e,t){var n=this.instruction_array.length,r=e.map(function(e){return e.name==="LDF"&&(e.value[0]=e.value[0]+n),e});return this.pc=n,this.instruction_array=this.instruction_array.concat(r),this.execute_instruction(this.instruction_array,n,undefined,t)},a.prototype.get_runtime_information=function(){return{pc:this.pc,operand_stack:this.operand_stack.to_transferable_object(),runtime_stack:this.runtime_stack.map(function(e){return e.to_transferable_object()}),environment:this.environment.to_transferable_object()}},a.prototype.suspend_for_ffi=function(e,t){return{status:u.Main.Request.FFI_CALL,value:{address:e,args:t}}},a.prototype.resume_from_ffi=function(e){this.operand_stack.pop(),this.operand_stack.push(e),this.pc++},a.prototype.to_transferable_object=function(){return{operand_stack:this.operand_stack.to_transferable_object(),environment:this.environment.to_transferable_object(),pc:this.pc,is_inside_web_worker:this.is_inside_web_worker,instruction_array:this.instruction_array}},a.prototype.clone_transferable_object=function(e){this.operand_stack.clone_transferable_object(e.operand_stack),this.environment.clone_transferable_object(e.environment),this.pc=e.pc,this.instruction_array=e.instruction_array},a.prototype.get_clone=function(){var e=new a([]);return e.clone_transferable_object(this.to_transferable_object()),e},a.prototype.stringify_value=function(e){function t(e){return e instanceof Array&&e.length===0?"[]":e instanceof Array&&e.length===2?"["+t(e[0])+", "+t(e[1])+"]":e instanceof Array?"["+e.map(function(e){return a.prototype.stringify_value.call(undefined,e)}).join(",")+"]":e.toString()}if(e===undefined)return"undefined";if(e instanceof Array)return t(e);if(e instanceof i)return e.is_native?l(e.toString()):e.source||f(e.toString());if(typeof e=="object"){var n;try{n=JSON.stringify(e,function(e,n){return e==="__METHODS__"?undefined:n instanceof Array?t(n):typeof n=="function"||n instanceof i?a.prototype.stringify_value.call(undefined,n):n},2)}catch(r){n="[object Object]"}return n.replace(/\"([^(\")"]+)\":/g,"$1:")}return e},a.prototype.reset_operand_stack=function(){this.operand_stack=new n},a.prototype.vm_value_to_javascript=function(e){return s.vm_value_to_javascript(this,e)},a.prototype.dump_instructions=function(){var e="\n",t=0;return this.instruction_array.forEach(function(n){e+=""+t+" "+n.name+" "+(n.value||"")+"\n",t++}),e},a.prototype.inject=function(e,t){var n={};n[e]=t,s.import_non_dom_modifying_function(this,[e],n)},a}),n("lib/parser/parser",["require","lib/parser/nodes"],function(e){var t=function(e,t,n,r){for(n=n||{},r=e.length;r--;n[e[r]]=t);return n},n=[1,18],r=[1,19],i=[1,30],s=[1,20],o=[1,21],u=[1,22],a=[1,23],f=[1,24],l=[1,25],c=[1,26],h=[1,28],p=[1,27],d=[1,29],v=[1,44],m=[1,35],g=[1,37],y=[1,38],b=[1,39],w=[1,40],E=[1,41],S=[1,42],x=[1,43],T=[16,38,39,40,41,42,43,45,46,47,48,49,50,51,52,53,55,62],N=[2,82],C=[1,53],k=[1,49],L=[5,9],A=[5,8,9,16,23,24,27,28,31,32,33,36,37,39,40,44,53,60,64,65,66,67,68,69,75],O=[1,62],M=[1,63],_=[1,64],D=[1,65],P=[1,66],H=[1,67],B=[1,68],j=[1,69],F=[1,70],I=[1,71],q=[1,72],R=[1,73],U=[1,74],z=[1,75],W=[1,76],X=[1,77],V=[1,78],$=[1,83],J=[1,85],K=[9,16,25,38,39,40,41,42,43,45,46,47,48,49,50,51,52,53,54,55,62,63,72],Q=[2,65],G=[1,91],Y=[2,89],Z=[5,8,9,16,23,24,25,26,27,28,31,32,33,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,60,62,63,64,65,66,67,68,69,72,75],et=[1,99],tt=[2,93],nt=[9,16,25,38,39,40,41,42,43,45,46,47,48,49,50,51,52,54,62,63,72],rt=[25,54],it=[9,16,25,38,39,40,45,46,47,48,49,50,51,52,54,62,63,72],st=[9,16,25,38,45,46,47,48,54,62,63,72],ot=[9,16,25,38,45,46,47,48,49,50,51,52,54,62,63,72],ut=[1,154],at={trace:function(){},yy:{},symbols_:{error:2,program:3,statements:4,EOF:5,statement_block:6,empty_block:7,"{":8,"}":9,non_empty_statements:10,statement:11,if_statement:12,while_statement:13,for_statement:14,break_statement:15,";":16,continue_statement:17,function_definition:18,return_statement:19,variable_definition:20,assignment_statement:21,expression:22,"if":23,"(":24,")":25,"else":26,"while":27,"for":28,for_initialiser:29,for_finaliser:30,"break":31,"continue":32,"function":33,identifier:34,identifiers:35,"return":36,"var":37,"=":38,"+":39,"-":40,"*":41,"/":42,"%":43,"!":44,"&&":45,"||":46,"===":47,"!==":48,">":49,"<":50,">=":51,"<=":52,"[":53,"]":54,".":55,constants:56,expressions:57,array_literal:58,object_literal:59,"new":60,function_expression:61,"?":62,":":63,STRING:64,FLOAT_NUMBER:65,INT_NUMBER:66,"true":67,"false":68,empty_list:69,non_empty_object_literal_statements:70,object_literal_statement:71,",":72,non_empty_expressions:73,non_empty_identifiers:74,Identifier:75,$accept:0,$end:1},terminals_:{2:"error",5:"EOF",8:"{",9:"}",16:";",23:"if",24:"(",25:")",26:"else",27:"while",28:"for",31:"break",32:"continue",33:"function",36:"return",37:"var",38:"=",39:"+",40:"-",41:"*",42:"/",43:"%",44:"!",45:"&&",46:"||",47:"===",48:"!==",49:">",50:"<",51:">=",52:"<=",53:"[",54:"]",55:".",60:"new",62:"?",63:":",64:"STRING",65:"FLOAT_NUMBER",66:"INT_NUMBER",67:"true",68:"false",69:"empty_list",72:",",75:"Identifier"},productions_:[0,[3,2],[3,2],[3,2],[7,2],[6,3],[4,0],[4,1],[10,2],[10,1],[11,1],[11,1],[11,1],[11,2],[11,2],[11,1],[11,2],[11,2],[11,2],[11,2],[11,1],[12,7],[12,7],[12,7],[12,7],[12,7],[12,7],[13,5],[13,5],[14,9],[14,9],[29,1],[29,1],[29,1],[29,0],[30,1],[30,1],[30,0],[15,1],[17,1],[18,6],[18,6],[19,2],[20,4],[21,3],[22,3],[22,3],[22,3],[22,3],[22,3],[22,2],[22,2],[22,2],[22,3],[22,3],[22,3],[22,3],[22,3],[22,3],[22,3],[22,3],[22,4],[22,3],[22,3],[22,1],[22,1],[22,6],[22,1],[22,1],[22,4],[22,6],[22,5],[22,1],[22,5],[56,1],[56,1],[56,1],[56,1],[56,1],[56,1],[58,3],[59,3],[59,1],[70,3],[70,1],[71,3],[61,5],[61,5],[57,1],[57,0],[73,3],[73,1],[35,1],[35,0],[74,3],[74,1],[34,1]],performAction:function(t,n,r,i,s,o,u){var a=o.length-1;switch(s){case 1:case 2:case 3:return o[a-1];case 4:this.$=[];break;case 5:case 63:this.$=o[a-1];break;case 6:case 89:case 93:this.$=[];break;case 8:o[a-1]===ft.no_op()?this.$=o[a]:this.$=ft.pair(o[a-1],o[a]);break;case 9:o[a]===ft.no_op()?this.$=[]:this.$=ft.pair(o[a],[]);break;case 20:this.$=ft.no_op();break;case 21:case 22:case 23:case 24:this.$=ft.if_statement(o[a-4],o[a-2],o[a],r);break;case 25:case 26:this.$=ft.if_statement(o[a-4],o[a-2],ft.pair(o[a],[]),r);break;case 27:case 28:this.$=ft.while_statement(o[a-2],o[a],r);break;case 29:case 30:this.$=ft.for_statement(o[a-6],o[a-4],o[a-2],o[a],r);break;case 38:this.$=ft.break_statement(r);break;case 39:this.$=ft.continue_statement(r);break;case 40:case 41:this.$=ft.variable_definition(o[a-4],ft.function_definition(o[a-4],o[a-2],o[a],u[a-5],u[a]),r);break;case 42:this.$=ft.return_statement(o[a],r);break;case 43:this.$=ft.variable_definition(o[a-2],o[a],r);break;case 44:o[a-2].tag==="variable"?this.$=ft.assignment(o[a-2],o[a],r):o[a-2].tag==="property_access"?this.$=ft.property_assignment(o[a-2].object,o[a-2].property,o[a],r):error("parse error in line "+r+": "+t);break;case 45:case 46:case 47:case 48:case 49:case 55:case 56:case 57:case 58:case 59:case 60:this.$=ft.eager_binary_expression(o[a-2],o[a-1],o[a],r);break;case 50:case 51:this.$=ft.eager_binary_expression(0,o[a-1],o[a],r);break;case 52:this.$=ft.eager_unary_expression(o[a-1],o[a],r);break;case 53:case 54:this.$=ft.boolean_operation(o[a-2],o[a-1],o[a],r);break;case 61:this.$=ft.property_access(o[a-3],o[a-1],r);break;case 62:this.$=ft.property_access(o[a-2],o[a],r);break;case 65:this.$=ft.variable(o[a],r);break;case 66:this.$=ft.application(o[a-4],o[a-1],r);break;case 69:this.$=ft.application(ft.variable(o[a-3],r),o[a-1],r);break;case 70:this.$=ft.object_method_application(o[a-5],o[a-3],o[a-1],r);break;case 71:this.$=ft.construction(o[a-3],o[a-1],r);break;case 73:this.$=ft.ternary(o[a-4],o[a-2],o[a],r);break;case 74:case 96:this.$=t;break;case 75:this.$=parseFloat(t);break;case 76:this.$=parseInt(t,10);break;case 77:this.$=!0;break;case 78:this.$=!1;break;case 79:this.$=ft.empty_list(r);break;case 80:this.$=ft.array_literal(o[a-1],r);break;case 81:this.$=ft.object_literal(o[a-1],r);break;case 82:this.$=ft.object_literal([],r);break;case 83:case 85:case 90:case 94:this.$=ft.pair(o[a-2],o[a]);break;case 84:case 91:case 95:this.$=ft.pair(o[a],[]);break;case 86:case 87:this.$=ft.function_definition("lambda",o[a-2],o[a],u[a-4],u[a]);break;case 88:case 92:this.$=o[a]}},table:[{3:1,4:2,5:[2,6],6:3,7:4,8:[1,6],10:5,11:7,12:8,13:9,14:10,15:11,16:n,17:12,18:13,19:14,20:15,21:16,22:17,23:r,24:i,27:s,28:o,31:u,32:a,33:f,34:32,36:l,37:c,39:h,40:p,44:d,53:v,56:31,58:33,59:34,60:m,61:36,64:g,65:y,66:b,67:w,68:E,69:S,75:x},{1:[3]},{5:[1,45]},{5:[1,46]},t(T,N,{5:[1,47]}),{5:[2,7]},{7:54,8:C,9:k,10:48,11:7,12:8,13:9,14:10,15:11,16:n,17:12,18:13,19:14,20:15,21:16,22:17,23:r,24:i,27:s,28:o,31:u,32:a,33:f,34:52,36:l,37:c,39:h,40:p,44:d,53:v,56:31,58:33,59:34,60:m,61:36,64:g,65:y,66:b,67:w,68:E,69:S,70:50,71:51,75:x},t(L,[2,9],{11:7,12:8,13:9,14:10,15:11,17:12,18:13,19:14,20:15,21:16,22:17,56:31,34:32,58:33,59:34,61:36,7:54,10:55,8:C,16:n,23:r,24:i,27:s,28:o,31:u,32:a,33:f,36:l,37:c,39:h,40:p,44:d,53:v,60:m,64:g,65:y,66:b,67:w,68:E,69:S,75:x}),t(A,[2,10]),t(A,[2,11]),t(A,[2,12]),{16:[1,56]},{16:[1,57]},t(A,[2,15]),{16:[1,58]},{16:[1,59]},{16:[1,60]},{16:[1,61],38:O,39:M,40:_,41:D,42:P,43:H,45:B,46:j,47:F,48:I,49:q,50:R,51:U,52:z,53:W,55:X,62:V},t(A,[2,20]),{24:[1,79]},{24:[1,80]},{24:[1,81]},{16:[2,38]},{16:[2,39]},{24:$,34:82,75:x},{7:54,8:C,22:84,24:i,33:J,34:32,39:h,40:p,44:d,53:v,56:31,58:33,59:34,60:m,61:36,64:g,65:y,66:b,67:w,68:E,69:S,75:x},{34:86,75:x},{7:54,8:C,22:87,24:i,33:J,34:32,39:h,40:p,44:d,53:v,56:31,58:33,59:34,60:m,61:36,64:g,65:y,66:b,67:w,68:E,69:S,75:x},{7:54,8:C,22:88,24:i,33:J,34:32,39:h,40:p,44:d,53:v,56:31,58:33,59:34,60:m,61:36,64:g,65:y,66:b,67:w,68:E,69:S,75:x},{7:54,8:C,22:89,24:i,33:J,34:32,39:h,40:p,44:d,53:v,56:31,58:33,59:34,60:m,61:36,64:g,65:y,66:b,67:w,68:E,69:S,75:x},{7:54,8:C,22:90,24:i,33:J,34:32,39:h,40:p,44:d,53:v,56:31,58:33,59:34,60:m,61:36,64:g,65:y,66:b,67:w,68:E,69:S,75:x},t(K,[2,64]),t(K,Q,{24:G}),t(K,[2,67]),t(K,[2,68]),{34:92,75:x},t(K,[2,72]),t(K,[2,74]),t(K,[2,75]),t(K,[2,76]),t(K,[2,77]),t(K,[2,78]),t(K,[2,79]),t([9,16,24,25,38,39,40,41,42,43,45,46,47,48,49,50,51,52,53,54,55,62,63,72],[2,96]),{7:54,8:C,22:95,24:i,33:J,34:32,39:h,40:p,44:d,53:v,54:Y,56:31,57:93,58:33,59:34,60:m,61:36,64:g,65:y,66:b,67:w,68:E,69:S,73:94,75:x},{1:[2,1]},{1:[2,2]},{1:[2,3]},{9:[1,96]},t(Z,[2,4]),{9:[1,97]},{9:[2,84],72:[1,98]},t(T,Q,{24:G,63:et}),{9:k,34:100,70:50,71:51,75:x},t(K,N),t(L,[2,8]),t(A,[2,13]),t(A,[2,14]),t(A,[2,16]),t(A,[2,17]),t(A,[2,18]),t(A,[2,19]),{7:54,8:C,22:101,24:i,33:J,34:32,39:h,40:p,44:d,53:v,56:31,58:33,59:34,60:m,61:36,64:g,65:y,66:b,67:w,68:E,69:S,75:x},{7:54,8:C,22:102,24:i,33:J,34:32,39:h,40:p,44:d,53:v,56:31,58:33,59:34,60:m,61:36,64:g,65:y,66:b,67:w,68:E,69:S,75:x},{7:54,8:C,22:103,24:i,33:J,34:32,39:h,40:p,44:d,53:v,56:31,58:33,59:34,60:m,61:36,64:g,65:y,66:b,67:w,68:E,69:S,75:x},{7:54,8:C,22:104,24:i,33:J,34:32,39:h,40:p,44:d,53:v,56:31,58:33,59:34,60:m,61:36,64:g,65:y,66:b,67:w,68:E,69:S,75:x},{7:54,8:C,22:105,24:i,33:J,34:32,39:h,40:p,44:d,53:v,56:31,58:33,59:34,60:m,61:36,64:g,65:y,66:b,67:w,68:E,69:S,75:x},{7:54,8:C,22:106,24:i,33:J,34:32,39:h,40:p,44:d,53:v,56:31,58:33,59:34,60:m,61:36,64:g,65:y,66:b,67:w,68:E,69:S,75:x},{7:54,8:C,22:107,24:i,33:J,34:32,39:h,40:p,44:d,53:v,56:31,58:33,59:34,60:m,61:36,64:g,65:y,66:b,67:w,68:E,69:S,75:x},{7:54,8:C,22:108,24:i,33:J,34:32,39:h,40:p,44:d,53:v,56:31,58:33,59:34,60:m,61:36,64:g,65:y,66:b,67:w,68:E,69:S,75:x},{7:54,8:C,22:109,24:i,33:J,34:32,39:h,40:p,44:d,53:v,56:31,58:33,59:34,60:m,61:36,64:g,65:y,66:b,67:w,68:E,69:S,75:x},{7:54,8:C,22:110,24:i,33:J,34:32,39:h,40:p,44:d,53:v,56:31,58:33,59:34,60:m,61:36,64:g,65:y,66:b,67:w,68:E,69:S,75:x},{7:54,8:C,22:111,24:i,33:J,34:32,39:h,40:p,44:d,53:v,56:31,58:33,59:34,60:m,61:36,64:g,65:y,66:b,67:w,68:E,69:S,75:x},{7:54,8:C,22:112,24:i,33:J,34:32,39:h,40:p,44:d,53:v,56:31,58:33,59:34,60:m,61:36,64:g,65:y,66:b,67:w,68:E,69:S,75:x},{7:54,8:C,22:113,24:i,33:J,34:32,39:h,40:p,44:d,53:v,56:31,58:33,59:34,60:m,61:36,64:g,65:y,66:b,67:w,68:E,69:S,75:x},{7:54,8:C,22:114,24:i,33:J,34:32,39:h,40:p,44:d,53:v,56:31,58:33,59:34,60:m,61:36,64:g,65:y,66:b,67:w,68:E,69:S,75:x},{7:54,8:C,22:115,24:i,33:J,34:32,39:h,40:p,44:d,53:v,56:31,58:33,59:34,60:m,61:36,64:g,65:y,66:b,67:w,68:E,69:S,75:x},{34:116,75:x},{7:54,8:C,22:117,24:i,33:J,34:32,39:h,40:p,44:d,53:v,56:31,58:33,59:34,60:m,61:36,64:g,65:y,66:b,67:w,68:E,69:S,75:x},{7:54,8:C,22:118,24:i,33:J,34:32,39:h,40:p,44:d,53:v,56:31,58:33,59:34,60:m,61:36,64:g,65:y,66:b,67:w,68:E,69:S,75:x},{7:54,8:C,22:119,24:i,33:J,34:32,39:h,40:p,44:d,53:v,56:31,58:33,59:34,60:m,61:36,64:g,65:y,66:b,67:w,68:E,69:S,75:x},{7:54,8:C,16:[2,34],20:122,21:123,22:121,24:i,29:120,33:J,34:32,37:c,39:h,40:p,44:d,53:v,56:31,58:33,59:34,60:m,61:36,64:g,65:y,66:b,67:w,68:E,69:S,75:x},{24:[1,124]},{25:tt,34:127,35:125,74:126,75:x},{16:[2,42],39:M,40:_,41:D,42:P,43:H,45:B,46:j,47:F,48:I,49:q,50:R,51:U,52:z,53:W,55:X,62:V},{24:$},{38:[1,128]},t(nt,[2,50],{53:W,55:X}),t(nt,[2,51],{53:W,55:X}),t(nt,[2,52],{53:W,55:X}),{25:[1,129],39:M,40:_,41:D,42:P,43:H,45:B,46:j,47:F,48:I,49:q,50:R,51:U,52:z,53:W,55:X,62:V},{7:54,8:C,22:95,24:i,25:Y,33:J,34:32,39:h,40:p,44:d,53:v,56:31,57:130,58:33,59:34,60:m,61:36,64:g,65:y,66:b,67:w,68:E,69:S,73:94,75:x},{24:[1,131]},{54:[1,132]},t(rt,[2,88]),t(rt,[2,91],{39:M,40:_,41:D,42:P,43:H,45:B,46:j,47:F,48:I,49:q,50:R,51:U,52:z,53:W,55:X,62:V,72:[1,133]}),t(Z,[2,5]),t(K,[2,81]),{34:100,70:134,71:51,75:x},{7:54,8:C,22:135,24:i,33:J,34:32,39:h,40:p,44:d,53:v,56:31,58:33,59:34,60:m,61:36,64:g,65:y,66:b,67:w,68:E,69:S,75:x},{63:et},t([16,25],[2,44],{39:M,40:_,41:D,42:P,43:H,45:B,46:j,47:F,48:I,49:q,50:R,51:U,52:z,53:W,55:X,62:V}),t(it,[2,45],{41:D,42:P,43:H,53:W,55:X}),t(it,[2,46],{41:D,42:P,43:H,53:W,55:X}),t(nt,[2,47],{53:W,55:X}),t(nt,[2,48],{53:W,55:X}),t(nt,[2,49],{53:W,55:X}),t([9,16,25,38,45,46,54,62,63,72],[2,53],{39:M,40:_,41:D,42:P,43:H,47:F,48:I,49:q,50:R,51:U,52:z,53:W,55:X}),t([9,16,25,38,46,54,62,63,72],[2,54],{39:M,40:_,41:D,42:P,43:H,45:B,47:F,48:I,49:q,50:R,51:U,52:z,53:W,55:X}),t(st,[2,55],{39:M,40:_,41:D,42:P,43:H,49:q,50:R,51:U,52:z,53:W,55:X}),t(st,[2,56],{39:M,40:_,41:D,42:P,43:H,49:q,50:R,51:U,52:z,53:W,55:X}),t(ot,[2,57],{39:M,40:_,41:D,42:P,43:H,53:W,55:X}),t(ot,[2,58],{39:M,40:_,41:D,42:P,43:H,53:W,55:X}),t(ot,[2,59],{39:M,40:_,41:D,42:P,43:H,53:W,55:X}),t(ot,[2,60],{39:M,40:_,41:D,42:P,43:H,53:W,55:X}),{39:M,40:_,41:D,42:P,43:H,45:B,46:j,47:F,48:I,49:q,50:R,51:U,52:z,53:W,54:[1,136],55:X,62:V},t(K,[2,62],{24:[1,137]}),{39:M,40:_,41:D,42:P,43:H,45:B,46:j,47:F,48:I,49:q,50:R,51:U,52:z,53:W,55:X,62:V,63:[1,138]},{25:[1,139],39:M,40:_,41:D,42:P,43:H,45:B,46:j,47:F,48:I,49:q,50:R,51:U,52:z,53:W,55:X,62:V},{25:[1,140],39:M,40:_,41:D,42:P,43:H,45:B,46:j,47:F,48:I,49:q,50:R,51:U,52:z,53:W,55:X,62:V},{16:[1,141]},{16:[2,31],38:O,39:M,40:_,41:D,42:P,43:H,45:B,46:j,47:F,48:I,49:q,50:R,51:U,52:z,53:W,55:X,62:V},{16:[2,32]},{16:[2,33]},{25:tt,34:127,35:142,74:126,75:x},{25:[1,143]},{25:[2,92]},{25:[2,95],72:[1,144]},{7:54,8:C,22:145,24:i,33:J,34:32,39:h,40:p,44:d,53:v,56:31,58:33,59:34,60:m,61:36,64:g,65:y,66:b,67:w,68:E,69:S,75:x},t(K,[2,63],{24:[1,146]}),{25:[1,147]},{7:54,8:C,22:95,24:i,25:Y,33:J,34:32,39:h,40:p,44:d,53:v,56:31,57:148,58:33,59:34,60:m,61:36,64:g,65:y,66:b,67:w,68:E,69:S,73:94,75:x},t(K,[2,80]),{7:54,8:C,22:95,24:i,33:J,34:32,39:h,40:p,44:d,53:v,56:31,58:33,59:34,60:m,61:36,64:g,65:y,66:b,67:w,68:E,69:S,73:149,75:x},{9:[2,83]},t([9,72],[2,85],{39:M,40:_,41:D,42:P,43:H,45:B,46:j,47:F,48:I,49:q,50:R,51:U,52:z,53:W,55:X,62:V}),t(K,[2,61]),{7:54,8:C,22:95,24:i,25:Y,33:J,34:32,39:h,40:p,44:d,53:v,56:31,57:150,58:33,59:34,60:m,61:36,64:g,65:y,66:b,67:w,68:E,69:S,73:94,75:x},{7:54,8:C,22:151,24:i,33:J,34:32,39:h,40:p,44:d,53:v,56:31,58:33,59:34,60:m,61:36,64:g,65:y,66:b,67:w,68:E,69:S,75:x},{6:152,7:153,8:ut},{6:155,7:156,8:ut},{7:54,8:C,22:157,24:i,33:J,34:32,39:h,40:p,44:d,53:v,56:31,58:33,59:34,60:m,61:36,64:g,65:y,66:b,67:w,68:E,69:S,75:x},{25:[1,158]},{6:159,7:160,8:ut},{34:127,74:161,75:x},{16:[2,43],39:M,40:_,41:D,42:P,43:H,45:B,46:j,47:F,48:I,49:q,50:R,51:U,52:z,53:W,55:X,62:V},{7:54,8:C,22:95,24:i,25:Y,33:J,34:32,39:h,40:p,44:d,53:v,56:31,57:162,58:33,59:34,60:m,61:36,64:g,65:y,66:b,67:w,68:E,69:S,73:94,75:x},t(K,[2,69]),{25:[1,163]},t(rt,[2,90]),{25:[1,164]},t([9,16,25,38,54,63,72],[2,73],{39:M,40:_,41:D,42:P,43:H,45:B,46:j,47:F,48:I,49:q,50:R,51:U,52:z,53:W,55:X,62:V}),{26:[1,165]},{26:[1,166]},{7:54,8:C,9:k,10:48,11:7,12:8,13:9,14:10,15:11,16:n,17:12,18:13,19:14,20:15,21:16,22:17,23:r,24:i,27:s,28:o,31:u,32:a,33:f,34:32,36:l,37:c,39:h,40:p,44:d,53:v,56:31,58:33,59:34,60:m,61:36,64:g,65:y,66:b,67:w,68:E,69:S,75:x},t(A,[2,27]),t(A,[2,28]),{16:[1,167],39:M,40:_,41:D,42:P,43:H,45:B,46:j,47:F,48:I,49:q,50:R,51:U,52:z,53:W,55:X,62:V},{6:168,7:169,8:ut},t(K,[2,86]),t(K,[2,87]),{25:[2,94]},{25:[1,170]},t(K,[2,71]),t(K,[2,70]),{6:171,7:172,8:ut,12:173,23:r},{6:174,7:175,8:ut,12:176,23:r},{7:54,8:C,21:178,22:179,24:i,25:[2,37],30:177,33:J,34:32,39:h,40:p,44:d,53:v,56:31,58:33,59:34,60:m,61:36,64:g,65:y,66:b,67:w,68:E,69:S,75:x},t(A,[2,40]),t(A,[2,41]),t(K,[2,66]),t(A,[2,21]),t(A,[2,22]),t(A,[2,25]),t(A,[2,23]),t(A,[2,24]),t(A,[2,26]),{25:[1,180]},{25:[2,35]},{25:[2,36],38:O,39:M,40:_,41:D,42:P,43:H,45:B,46:j,47:F,48:I,49:q,50:R,51:U,52:z,53:W,55:X,62:V},{6:181,7:182,8:ut},t(A,[2,29]),t(A,[2,30])],defaultActions:{5:[2,7],22:[2,38],23:[2,39],45:[2,1],46:[2,2],47:[2,3],122:[2,32],123:[2,33],126:[2,92],134:[2,83],161:[2,94],178:[2,35]},parseError:function(t,n){if(!n.recoverable){function r(e,t){this.message=e,this.hash=t}throw r.prototype=new Error,new r(t,n)}this.trace(t)},parse:function(t){function w(e){r.length=r.length-2*e,s.length=s.length-e,o.length=o.length-e}var n=this,r=[0],i=[],s=[null],o=[],u=this.table,a="",f=0,l=0,c=0,h=2,p=1,d=o.slice.call(arguments,1),v=Object.create(this.lexer),m={yy:{}};for(var g in this.yy)Object.prototype.hasOwnProperty.call(this.yy,g)&&(m.yy[g]=this.yy[g]);v.setInput(t,m.yy),m.yy.lexer=v,m.yy.parser=this,typeof v.yylloc=="undefined"&&(v.yylloc={});var y=v.yylloc;o.push(y);var b=v.options&&v.options.ranges;typeof m.yy.parseError=="function"?this.parseError=m.yy.parseError:this.parseError=Object.getPrototypeOf(this).parseError;function E(){var e;return e=v.lex()||p,typeof e!="number"&&(e=n.symbols_[e]||e),e}var S,x,T,N,C,k,L={},A,O,M,_;for(;;){T=r[r.length-1];if(this.defaultActions[T])N=this.defaultActions[T];else{if(S===null||typeof S=="undefined")S=E();N=u[T]&&u[T][S]}if(typeof N=="undefined"||!N.length||!N[0]){var D="";_=[];for(A in u[T])this.terminals_[A]&&A>h&&_.push("'"+this.terminals_[A]+"'");v.showPosition?D="Parse error on line "+(f+1)+":\n"+v.showPosition()+"\nExpecting "+_.join(", ")+", got '"+(this.terminals_[S]||S)+"'":D="Parse error on line "+(f+1)+": Unexpected "+(S==p?"end of input":"'"+(this.terminals_[S]||S)+"'"),this.parseError(D,{text:v.match,token:this.terminals_[S]||S,line:v.yylineno,loc:y,expected:_})}if(N[0]instanceof Array&&N.length>1)throw new Error("Parse Error: multiple actions possible at state: "+T+", token: "+S);switch(N[0]){case 1:r.push(S),s.push(v.yytext),o.push(v.yylloc),r.push(N[1]),S=null,x?(S=x,x=null):(l=v.yyleng,a=v.yytext,f=v.yylineno,y=v.yylloc,c>0&&c--);break;case 2:O=this.productions_[N[1]][1],L.$=s[s.length-O],L._$={first_line:o[o.length-(O||1)].first_line,last_line:o[o.length-1].last_line,first_column:o[o.length-(O||1)].first_column,last_column:o[o.length-1].last_column},b&&(L._$.range=[o[o.length-(O||1)].range[0],o[o.length-1].range[1]]),k=this.performAction.apply(L,[a,l,f,m.yy,N[1],s,o].concat(d));if(typeof k!="undefined")return k;O&&(r=r.slice(0,-1*O*2),s=s.slice(0,-1*O),o=o.slice(0,-1*O)),r.push(this.productions_[N[1]][0]),s.push(L.$),o.push(L._$),M=u[r[r.length-2]][r[r.length-1]],r.push(M);break;case 3:return!0}}return!0}},ft=e("lib/parser/nodes"),lt=function(){var e={EOF:1,parseError:function(t,n){if(!this.yy.parser)throw new Error(t);this.yy.parser.parseError(t,n)},setInput:function(e,t){return this.yy=t||this.yy||{},this._input=e,this._more=this._backtrack=this.done=!1,this.yylineno=this.yyleng=0,this.yytext=this.matched=this.match="",this.conditionStack=["INITIAL"],this.yylloc={first_line:1,first_column:0,last_line:1,last_column:0},this.options.ranges&&(this.yylloc.range=[0,0]),this.offset=0,this},input:function(){var e=this._input[0];this.yytext+=e,this.yyleng++,this.offset++,this.match+=e,this.matched+=e;var t=e.match(/(?:\r\n?|\n).*/g);return t?(this.yylineno++,this.yylloc.last_line++):this.yylloc.last_column++,this.options.ranges&&this.yylloc.range[1]++,this._input=this._input.slice(1),e},unput:function(e){var t=e.length,n=e.split(/(?:\r\n?|\n)/g);this._input=e+this._input,this.yytext=this.yytext.substr(0,this.yytext.length-t),this.offset-=t;var r=this.match.split(/(?:\r\n?|\n)/g);this.match=this.match.substr(0,this.match.length-1),this.matched=this.matched.substr(0,this.matched.length-1),n.length-1&&(this.yylineno-=n.length-1);var i=this.yylloc.range;return this.yylloc={first_line:this.yylloc.first_line,last_line:this.yylineno+1,first_column:this.yylloc.first_column,last_column:n?(n.length===r.length?this.yylloc.first_column:0)+r[r.length-n.length].length-n[0].length:this.yylloc.first_column-t},this.options.ranges&&(this.yylloc.range=[i[0],i[0]+this.yyleng-t]),this.yyleng=this.yytext.length,this},more:function(){return this._more=!0,this},reject:function(){return this.options.backtrack_lexer?(this._backtrack=!0,this):this.parseError("Lexical error on line "+(this.yylineno+1)+". You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).\n"+this.showPosition(),{text:"",token:null,line:this.yylineno})},less:function(e){this.unput(this.match.slice(e))},pastInput:function(){var e=this.matched.substr(0,this.matched.length-this.match.length);return(e.length>20?"...":"")+e.substr(-20).replace(/\n/g,"")},upcomingInput:function(){var e=this.match;return e.length<20&&(e+=this._input.substr(0,20-e.length)),(e.substr(0,20)+(e.length>20?"...":"")).replace(/\n/g,"")},showPosition:function(){var e=this.pastInput(),t=(new Array(e.length+1)).join("-");return e+this.upcomingInput()+"\n"+t+"^"},test_match:function(e,t){var n,r,i;this.options.backtrack_lexer&&(i={yylineno:this.yylineno,yylloc:{first_line:this.yylloc.first_line,last_line:this.last_line,first_column:this.yylloc.first_column,last_column:this.yylloc.last_column},yytext:this.yytext,match:this.match,matches:this.matches,matched:this.matched,yyleng:this.yyleng,offset:this.offset,_more:this._more,_input:this._input,yy:this.yy,conditionStack:this.conditionStack.slice(0),done:this.done},this.options.ranges&&(i.yylloc.range=this.yylloc.range.slice(0))),r=e[0].match(/(?:\r\n?|\n).*/g),r&&(this.yylineno+=r.length),this.yylloc={first_line:this.yylloc.last_line,last_line:this.yylineno+1,first_column:this.yylloc.last_column,last_column:r?r[r.length-1].length-r[r.length-1].match(/\r?\n?/)[0].length:this.yylloc.last_column+e[0].length},this.yytext+=e[0],this.match+=e[0],this.matches=e,this.yyleng=this.yytext.length,this.options.ranges&&(this.yylloc.range=[this.offset,this.offset+=this.yyleng]),this._more=!1,this._backtrack=!1,this._input=this._input.slice(e[0].length),this.matched+=e[0],n=this.performAction.call(this,this.yy,this,t,this.conditionStack[this.conditionStack.length-1]),this.done&&this._input&&(this.done=!1);if(n)return n;if(this._backtrack){for(var s in i)this[s]=i[s];return!1}return!1},next:function(){if(this.done)return this.EOF;this._input||(this.done=!0);var e,t,n,r;this._more||(this.yytext="",this.match="");var i=this._currentRules();for(var s=0;s<i.length;s++){n=this._input.match(this.rules[i[s]]);if(n&&(!t||n[0].length>t[0].length)){t=n,r=s;if(this.options.backtrack_lexer){e=this.test_match(n,i[s]);if(e!==!1)return e;if(this._backtrack){t=!1;continue}return!1}if(!this.options.flex)break}}return t?(e=this.test_match(t,i[r]),e!==!1?e:!1):this._input===""?this.EOF:this.parseError("Lexical error on line "+(this.yylineno+1)+". Unrecognized text.\n"+this.showPosition(),{text:"",token:null,line:this.yylineno})},lex:function(){var t=this.next();return t?t:this.lex()},begin:function(t){this.conditionStack.push(t)},popState:function(){var t=this.conditionStack.length-1;return t>0?this.conditionStack.pop():this.conditionStack[0]},_currentRules:function(){return this.conditionStack.length&&this.conditionStack[this.conditionStack.length-1]?this.conditions[this.conditionStack[this.conditionStack.length-1]].rules:this.conditions.INITIAL.rules},topState:function(t){return t=this.conditionStack.length-1-Math.abs(t||0),t>=0?this.conditionStack[t]:"INITIAL"},pushState:function(t){this.begin(t)},stateStackSize:function(){return this.conditionStack.length},options:{},performAction:function(t,n,r,i){var s=i;switch(r){case 0:break;case 1:break;case 2:break;case 3:return 33;case 4:return"INVALID";case 5:return 36;case 6:return 23;case 7:return 26;case 8:return 27;case 9:return 28;case 10:return"case";case 11:return"default";case 12:return 60;case 13:return 31;case 14:return 32;case 15:return 37;case 16:return 47;case 17:return 38;case 18:return 8;case 19:return 9;case 20:return 16;case 21:return 72;case 22:return 67;case 23:return 68;case 24:return 69;case 25:return 53;case 26:return 54;case 27:return 55;case 28:this.begin("DoubleQuotedString"),this.string="";break;case 29:this.begin("SingleQuotedString"),this.string="";break;case 30:this.begin("QuotedStringEscape");break;case 31:return n.yytext=this.string,this.string=undefined,this.popState(),64;case 32:return n.yytext=this.string,this.string=undefined,this.popState(),64;case 33:switch(n.yytext){case"\r\n":case"\n":break;case"b":this.string+="\b";break;case"n":this.string+="\n";break;case"r":this.string+="\r";break;case"t":this.string+="	";break;case"'":this.string+="'";break;case'"':this.string+='"';break;case"\\":this.string+="\\";break;default:this.string+="\\"+$1}this.popState();break;case 34:this.string+=n.yytext;break;case 35:this.string+=n.yytext;break;case 36:return 75;case 37:return 65;case 38:return 66;case 39:return 39;case 40:return 40;case 41:return 41;case 42:return 42;case 43:return 43;case 44:return 48;case 45:return 52;case 46:return 51;case 47:return 50;case 48:return 49;case 49:return 44;case 50:return 45;case 51:return 46;case 52:return 24;case 53:return 25;case 54:return 62;case 55:return 63;case 56:return 5;case 57:return"INVALID"}},rules:[/^(?:\/\/([^\n\r]*))/,/^(?:\/\*([\u0000-\uffff]*?)\*\/)/,/^(?:\s+)/,/^(?:function\b)/,/^(?:return\s*\n)/,/^(?:return\b)/,/^(?:if\b)/,/^(?:else\b)/,/^(?:while\b)/,/^(?:for\b)/,/^(?:case\b)/,/^(?:default\b)/,/^(?:new\b)/,/^(?:break\b)/,/^(?:continue\b)/,/^(?:var\b)/,/^(?:===)/,/^(?:=)/,/^(?:\{)/,/^(?:\})/,/^(?:;)/,/^(?:,)/,/^(?:true\b)/,/^(?:false\b)/,/^(?:\[\])/,/^(?:\[)/,/^(?:\])/,/^(?:\.)/,/^(?:")/,/^(?:')/,/^(?:\\)/,/^(?:")/,/^(?:')/,/^(?:(.|\r\n|\n))/,/^(?:[^"\\]*)/,/^(?:[^'\\]*)/,/^(?:[A-Za-z_][A-Za-z0-9_]*)/,/^(?:[0-9]+(\.[0-9]+)?([eE][\-+]?[0-9]+)?\b)/,/^(?:[0-9]+\b)/,/^(?:\+)/,/^(?:-)/,/^(?:\*)/,/^(?:\/)/,/^(?:%)/,/^(?:!==)/,/^(?:<=)/,/^(?:>=)/,/^(?:<)/,/^(?:>)/,/^(?:!)/,/^(?:&&)/,/^(?:\|\|)/,/^(?:\()/,/^(?:\))/,/^(?:\?)/,/^(?::)/,/^(?:$)/,/^(?:.)/],conditions:{QuotedStringEscape:{rules:[33],inclusive:!1},SingleQuotedString:{rules:[30,32,35],inclusive:!1},DoubleQuotedString:{rules:[30,31,34],inclusive:!1},INITIAL:{rules:[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57],inclusive:!0}}};return e}();return at.lexer=lt,at.lexer.options.ranges=!0,at}),n("lib/debug/debugException",[],function(){"use strict";function e(e){this.message=e}return e}),n("lib/debug/debug",["lib/parser/parser","lib/compiler/compiler","lib/vm/runtime","lib/debug/debugException","lib/messageLibrary","lib/vm/internal/environment","lib/vm/internal/closure"],function(e,t,n,r,s,o,u){function a(e,t,n){this.source=e,this.runtime=null,this.symbol=t,this.context=n,this.instructionArray=null,this.debugSymbols=null,this.lineNumbers=null,this.breakpoints={},this.lastBreakpoint=undefined,this.status=s.VM.Response.INSTANCE_UNDEFINED,this.__init()}return a.prototype.__init=function(){if(typeof this.source!="string")throw new r("Source code is not a string.");var i=t(e.parse(this.source),this.source);this.instructionArray=i.instructions,this.debugSymbols=i.debug,this.lineNumbers=i.debug.map(function(e){return e.line}),this.runtime=new n(this.symbol,this.context)},a.prototype.start=function(){if(this.lastBreakpoint===undefined&&this.breakpoints[0])return this.lastBreakpoint=0,{value:null,status:s.VM.Response.INSTANCE_SET};if(this.status===s.VM.Response.EXECUTION_FINISHED)return{value:null,status:this.status};var e=this.runtime.execute_instruction(this.instructionArray,this.lastBreakpoint,this.breakpoints);this.status=e.status;var t=this.runtime.get_runtime_information();this.lastBreakpoint=t.pc;var n=t.operand_stack.length===0?null:t.operand_stack[t.operand_stack.length-1];return{value:n,status:e.status}},a.prototype.setBreakpoints=function(e){var t={};for(var n=0;n<e.length;n++){var r=e[n],i=this.__getFirstInstructionNumber(r);t[i]=!0}this.breakpoints=t},a.prototype.getScopeVariables=function(e){var t=e||this.runtime.environment,n={};return n.variables=this.__getVariablesInFrame(t.__env),n.parent=t.parent===null?null:this.getScopeVariables(t.parent.parent),n},a.prototype.getCallStack=function(){var e=this.__getInfo().runtime_stack,t=[];for(var n=0;n<e.length;n++)t.push(this.__getFunctionName(e[n].pc));var r=this.__getFunctionName(this.lastBreakpoint);return t.push(r),t},a.prototype.getDebugInfo=function(){var e=this.getCallStack(),t=this.__recurseThroughFrames(),n=[];for(i=0;i<e.length;i++){var r={};r.name=e[i],r.env=this.__filterNativevariables(t[i]),n.push(r)}return n},a.prototype.getCurrentLineNumber=function(){return this.lineNumbers[this.runtime.pc]},a.prototype.__getInfo=function(){return this.runtime.get_runtime_information()},a.prototype.__getVariablesInFrame=function(e){var t={};for(var n in e){if(n==="this")continue;n.charAt(0)!==":"&&e.hasOwnProperty(n)&&(t[n]=e[n])}return t},a.prototype.__recurseThroughFrames=function(){var e=this.__getInfo().runtime_stack,t=this.__getInfo().environment,n=[];for(var r=0;r<e.length;r++){var i=e[r].environment,s=this.__getVariablesInFrame(i);n.push(s)}return n.push(this.__getVariablesInFrame(t)),n},a.prototype.__getFunctionName=function(e){return this.debugSymbols[e].function_name},a.prototype.__getFirstInstructionNumber=function(e){var t=this.lineNumbers.indexOf(e);if(t!==-1&&this.instructionArray[t].name!=="DECLARE")return t;for(var n=0;n<this.lineNumbers.length;n++){if(this.instructionArray[n].name==="DECLARE")continue;if(e==this.lineNumbers[n])return n}},a.prototype.__filterNativevariables=function(e){var t={};for(var n in e){if(e.hasOwnProperty(n)){var r=e[n];if(r instanceof u&&r.is_native)continue;if(r!==undefined&&r!==null&&r.__NATIVE_OBJECT__)continue}e[n]===undefined?t[n]=e[n]:t[n]=this.runtime.stringify_value(e[n])}return t},a}),n("lib/main",["require","lib/compiler/compiler","lib/vm/runtime","lib/debug/debug"],function(e){return{version:"0.1.22",Parser:function(t){var n=e("lib/parser/parser-week-"+t+".js");return n.yy.parseError=n.parseError,n},Compiler:{compile:e("lib/compiler/compiler")},Runtime:e("lib/vm/runtime"),Debug:e("lib/debug/debug")}}),n("lib/parser/parser-week-3.js",["require","lib/parser/nodes"],function(e){var t=function(e,t,n,r){for(n=n||{},r=e.length;r--;n[e[r]]=t);return n},n=[1,6],r=[1,13],i=[1,14],s=[1,21],o=[1,15],u=[1,16],a=[1,17],f=[1,19],l=[1,18],c=[1,20],h=[1,25],p=[1,26],d=[1,27],v=[1,28],m=[1,29],g=[1,30],y=[1,31],b=[5,9],w=[5,9,15,18,19,22,25,26,28,29,33,48,49,50,51,52,53,57],E=[1,41],S=[1,42],x=[1,43],T=[1,44],N=[1,45],C=[1,46],k=[1,47],L=[1,48],A=[1,49],O=[1,50],M=[1,51],_=[1,52],D=[1,53],P=[1,54],H=[1,55],B=[1,58],j=[1,60],F=[15,20,28,29,30,31,32,34,35,36,37,38,39,40,41,42,46,47,55],I=[5,9,15,18,19,20,21,22,25,26,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,46,47,48,49,50,51,52,53,55,57],q=[2,64],R=[15,20,28,29,30,31,32,34,35,36,37,38,39,40,41,46,47,55],U=[2,60],z=[15,20,28,29,34,35,36,37,38,39,40,41,46,47,55],W=[15,20,34,35,36,37,46,47,55],X=[15,20,34,35,36,37,38,39,40,41,46,47,55],V={trace:function(){},yy:{},symbols_:{error:2,program:3,statements:4,EOF:5,statement_block:6,empty_block:7,"{":8,"}":9,non_empty_statements:10,statement:11,if_statement:12,function_definition:13,return_statement:14,";":15,variable_definition:16,expression:17,"if":18,"(":19,")":20,"else":21,"function":22,identifier:23,identifiers:24,"return":25,"var":26,"=":27,"+":28,"-":29,"*":30,"/":31,"%":32,"!":33,"&&":34,"||":35,"===":36,"!==":37,">":38,"<":39,">=":40,"<=":41,".":42,constants:43,expressions:44,function_expression:45,"?":46,":":47,STRING:48,FLOAT_NUMBER:49,INT_NUMBER:50,"true":51,"false":52,empty_list:53,non_empty_expressions:54,",":55,non_empty_identifiers:56,Identifier:57,$accept:0,$end:1},terminals_:{2:"error",5:"EOF",8:"{",9:"}",15:";",18:"if",19:"(",20:")",21:"else",22:"function",25:"return",26:"var",27:"=",28:"+",29:"-",30:"*",31:"/",32:"%",33:"!",34:"&&",35:"||",36:"===",37:"!==",38:">",39:"<",40:">=",41:"<=",42:".",46:"?",47:":",48:"STRING",49:"FLOAT_NUMBER",50:"INT_NUMBER",51:"true",52:"false",53:"empty_list",55:",",57:"Identifier"},productions_:[0,[3,2],[3,2],[3,2],[7,2],[6,3],[4,0],[4,1],[10,2],[10,1],[11,1],[11,1],[11,2],[11,2],[11,2],[11,1],[12,7],[12,7],[12,7],[12,7],[12,7],[12,7],[13,6],[13,6],[14,2],[16,4],[17,3],[17,3],[17,3],[17,3],[17,3],[17,2],[17,2],[17,2],[17,3],[17,3],[17,3],[17,3],[17,3],[17,3],[17,3],[17,3],[17,3],[17,3],[17,1],[17,1],[17,6],[17,4],[17,6],[17,1],[17,5],[43,1],[43,1],[43,1],[43,1],[43,1],[43,1],[45,5],[45,5],[44,1],[44,0],[54,3],[54,1],[24,1],[24,0],[56,3],[56,1],[23,1]],performAction:function(t,n,r,i,s,o,u){var a=o.length-1;switch(s){case 1:case 2:case 3:return o[a-1];case 4:this.$=[];break;case 5:case 43:this.$=o[a-1];break;case 6:case 60:case 64:this.$=[];break;case 8:o[a-1]===$.no_op()?this.$=o[a]:this.$=$.pair(o[a-1],o[a]);break;case 9:o[a]===$.no_op()?this.$=[]:this.$=$.pair(o[a],[]);break;case 15:this.$=$.no_op();break;case 16:case 17:case 18:case 19:this.$=$.if_statement(o[a-4],o[a-2],o[a],r);break;case 20:case 21:this.$=$.if_statement(o[a-4],o[a-2],$.pair(o[a],[]),r);break;case 22:case 23:this.$=$.variable_definition(o[a-4],$.function_definition(o[a-4],o[a-2],o[a],u[a-5],u[a]),r);break;case 24:this.$=$.return_statement(o[a],r);break;case 25:this.$=$.variable_definition(o[a-2],o[a],r);break;case 26:case 27:case 28:case 29:case 30:case 36:case 37:case 38:case 39:case 40:case 41:this.$=$.eager_binary_expression(o[a-2],o[a-1],o[a],r);break;case 31:case 32:this.$=$.eager_binary_expression(0,o[a-1],o[a],r);break;case 33:this.$=$.eager_unary_expression(o[a-1],o[a],r);break;case 34:case 35:this.$=$.boolean_operation(o[a-2],o[a-1],o[a],r);break;case 42:this.$=$.property_access(o[a-2],o[a],r);break;case 45:this.$=$.variable(o[a],r);break;case 46:this.$=$.application(o[a-4],o[a-1],r);break;case 47:this.$=$.application($.variable(o[a-3],r),o[a-1],r);break;case 48:this.$=$.object_method_application(o[a-5],o[a-3],o[a-1],r);break;case 50:this.$=$.ternary(o[a-4],o[a-2],o[a],r);break;case 51:case 67:this.$=t;break;case 52:this.$=parseFloat(t);break;case 53:this.$=parseInt(t,10);break;case 54:this.$=!0;break;case 55:this.$=!1;break;case 56:this.$=$.empty_list(r);break;case 57:case 58:this.$=$.function_definition("lambda",o[a-2],o[a],u[a-4],u[a]);break;case 59:case 63:this.$=o[a];break;case 61:case 65:this.$=$.pair(o[a-2],o[a]);break;case 62:case 66:this.$=$.pair(o[a],[])}},table:[{3:1,4:2,5:[2,6],6:3,7:4,8:n,10:5,11:7,12:8,13:9,14:10,15:r,16:11,17:12,18:i,19:s,22:o,23:23,25:u,26:a,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},{1:[3]},{5:[1,32]},{5:[1,33]},{5:[1,34]},{5:[2,7]},{9:[1,36],10:35,11:7,12:8,13:9,14:10,15:r,16:11,17:12,18:i,19:s,22:o,23:23,25:u,26:a,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},t(b,[2,9],{11:7,12:8,13:9,14:10,16:11,17:12,43:22,23:23,45:24,10:37,15:r,18:i,19:s,22:o,25:u,26:a,28:f,29:l,33:c,48:h,49:p,50:d,51:v,52:m,53:g,57:y}),t(w,[2,10]),t(w,[2,11]),{15:[1,38]},{15:[1,39]},{15:[1,40],28:E,29:S,30:x,31:T,32:N,34:C,35:k,36:L,37:A,38:O,39:M,40:_,41:D,42:P,46:H},t(w,[2,15]),{19:[1,56]},{19:B,23:57,57:y},{17:59,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},{23:61,57:y},{17:62,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},{17:63,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},{17:64,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},{17:65,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},t(F,[2,44]),t(F,[2,45],{19:[1,66]}),t(F,[2,49]),t(F,[2,51]),t(F,[2,52]),t(F,[2,53]),t(F,[2,54]),t(F,[2,55]),t(F,[2,56]),t([15,19,20,27,28,29,30,31,32,34,35,36,37,38,39,40,41,42,46,47,55],[2,67]),{1:[2,1]},{1:[2,2]},{1:[2,3]},{9:[1,67]},t(I,[2,4]),t(b,[2,8]),t(w,[2,12]),t(w,[2,13]),t(w,[2,14]),{17:68,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},{17:69,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},{17:70,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},{17:71,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},{17:72,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},{17:73,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},{17:74,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},{17:75,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},{17:76,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},{17:77,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},{17:78,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},{17:79,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},{17:80,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},{23:81,57:y},{17:82,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},{17:83,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},{19:[1,84]},{20:q,23:87,24:85,56:86,57:y},{15:[2,24],28:E,29:S,30:x,31:T,32:N,34:C,35:k,36:L,37:A,38:O,39:M,40:_,41:D,42:P,46:H},{19:B},{27:[1,88]},t(R,[2,31],{42:P}),t(R,[2,32],{42:P}),t(R,[2,33],{42:P}),{20:[1,89],28:E,29:S,30:x,31:T,32:N,34:C,35:k,36:L,37:A,38:O,39:M,40:_,41:D,42:P,46:H},{17:92,19:s,20:U,22:j,23:23,28:f,29:l,33:c,43:22,44:90,45:24,48:h,49:p,50:d,51:v,52:m,53:g,54:91,57:y},t(I,[2,5]),t(z,[2,26],{30:x,31:T,32:N,42:P}),t(z,[2,27],{30:x,31:T,32:N,42:P}),t(R,[2,28],{42:P}),t(R,[2,29],{42:P}),t(R,[2,30],{42:P}),t([15,20,34,35,46,47,55],[2,34],{28:E,29:S,30:x,31:T,32:N,36:L,37:A,38:O,39:M,40:_,41:D,42:P}),t([15,20,35,46,47,55],[2,35],{28:E,29:S,30:x,31:T,32:N,34:C,36:L,37:A,38:O,39:M,40:_,41:D,42:P}),t(W,[2,36],{28:E,29:S,30:x,31:T,32:N,38:O,39:M,40:_,41:D,42:P}),t(W,[2,37],{28:E,29:S,30:x,31:T,32:N,38:O,39:M,40:_,41:D,42:P}),t(X,[2,38],{28:E,29:S,30:x,31:T,32:N,42:P}),t(X,[2,39],{28:E,29:S,30:x,31:T,32:N,42:P}),t(X,[2,40],{28:E,29:S,30:x,31:T,32:N,42:P}),t(X,[2,41],{28:E,29:S,30:x,31:T,32:N,42:P}),t(F,[2,42],{19:[1,93]}),{28:E,29:S,30:x,31:T,32:N,34:C,35:k,36:L,37:A,38:O,39:M,40:_,41:D,42:P,46:H,47:[1,94]},{20:[1,95],28:E,29:S,30:x,31:T,32:N,34:C,35:k,36:L,37:A,38:O,39:M,40:_,41:D,42:P,46:H},{20:q,23:87,24:96,56:86,57:y},{20:[1,97]},{20:[2,63]},{20:[2,66],55:[1,98]},{17:99,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},t(F,[2,43],{19:[1,100]}),{20:[1,101]},{20:[2,59]},{20:[2,62],28:E,29:S,30:x,31:T,32:N,34:C,35:k,36:L,37:A,38:O,39:M,40:_,41:D,42:P,46:H,55:[1,102]},{17:92,19:s,20:U,22:j,23:23,28:f,29:l,33:c,43:22,44:103,45:24,48:h,49:p,50:d,51:v,52:m,53:g,54:91,57:y},{17:104,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},{6:105,7:106,8:n},{20:[1,107]},{6:108,7:109,8:n},{23:87,56:110,57:y},{15:[2,25],28:E,29:S,30:x,31:T,32:N,34:C,35:k,36:L,37:A,38:O,39:M,40:_,41:D,42:P,46:H},{17:92,19:s,20:U,22:j,23:23,28:f,29:l,33:c,43:22,44:111,45:24,48:h,49:p,50:d,51:v,52:m,53:g,54:91,57:y},t(F,[2,47]),{17:92,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,54:112,57:y},{20:[1,113]},t([15,20,47,55],[2,50],{28:E,29:S,30:x,31:T,32:N,34:C,35:k,36:L,37:A,38:O,39:M,40:_,41:D,42:P,46:H}),{21:[1,114]},{21:[1,115]},{6:116,7:117,8:n},t(F,[2,57]),t(F,[2,58]),{20:[2,65]},{20:[1,118]},{20:[2,61]},t(F,[2,48]),{6:119,7:120,8:n,12:121,18:i},{6:122,7:123,8:n,12:124,18:i},t(w,[2,22]),t(w,[2,23]),t(F,[2,46]),t(w,[2,16]),t(w,[2,17]),t(w,[2,20]),t(w,[2,18]),t(w,[2,19]),t(w,[2,21])],defaultActions:{5:[2,7],32:[2,1],33:[2,2],34:[2,3],86:[2,63],91:[2,59],110:[2,65],112:[2,61]},parseError:function(t,n){if(!n.recoverable){function r(e,t){this.message=e,this.hash=t}throw r.prototype=new Error,new r(t,n)}this.trace(t)},parse:function(t){function w(e){r.length=r.length-2*e,s.length=s.length-e,o.length=o.length-e}var n=this,r=[0],i=[],s=[null],o=[],u=this.table,a="",f=0,l=0,c=0,h=2,p=1,d=o.slice.call(arguments,1),v=Object.create(this.lexer),m={yy:{}};for(var g in this.yy)Object.prototype.hasOwnProperty.call(this.yy,g)&&(m.yy[g]=this.yy[g]);v.setInput(t,m.yy),m.yy.lexer=v,m.yy.parser=this,typeof v.yylloc=="undefined"&&(v.yylloc={});var y=v.yylloc;o.push(y);var b=v.options&&v.options.ranges;typeof m.yy.parseError=="function"?this.parseError=m.yy.parseError:this.parseError=Object.getPrototypeOf(this).parseError;function E(){var e;return e=v.lex()||p,typeof e!="number"&&(e=n.symbols_[e]||e),e}var S,x,T,N,C,k,L={},A,O,M,_;for(;;){T=r[r.length-1];if(this.defaultActions[T])N=this.defaultActions[T];else{if(S===null||typeof S=="undefined")S=E();N=u[T]&&u[T][S]}if(typeof N=="undefined"||!N.length||!N[0]){var D="";_=[];for(A in u[T])this.terminals_[A]&&A>h&&_.push("'"+this.terminals_[A]+"'");v.showPosition?D="Parse error on line "+(f+1)+":\n"+v.showPosition()+"\nExpecting "+_.join(", ")+", got '"+(this.terminals_[S]||S)+"'":D="Parse error on line "+(f+1)+": Unexpected "+(S==p?"end of input":"'"+(this.terminals_[S]||S)+"'"),this.parseError(D,{text:v.match,token:this.terminals_[S]||S,line:v.yylineno,loc:y,expected:_})}if(N[0]instanceof Array&&N.length>1)throw new Error("Parse Error: multiple actions possible at state: "+T+", token: "+S);switch(N[0]){case 1:r.push(S),s.push(v.yytext),o.push(v.yylloc),r.push(N[1]),S=null,x?(S=x,x=null):(l=v.yyleng,a=v.yytext,f=v.yylineno,y=v.yylloc,c>0&&c--);break;case 2:O=this.productions_[N[1]][1],L.$=s[s.length-O],L._$={first_line:o[o.length-(O||1)].first_line,last_line:o[o.length-1].last_line,first_column:o[o.length-(O||1)].first_column,last_column:o[o.length-1].last_column},b&&(L._$.range=[o[o.length-(O||1)].range[0],o[o.length-1].range[1]]),k=this.performAction.apply(L,[a,l,f,m.yy,N[1],s,o].concat(d));if(typeof k!="undefined")return k;O&&(r=r.slice(0,-1*O*2),s=s.slice(0,-1*O),o=o.slice(0,-1*O)),r.push(this.productions_[N[1]][0]),s.push(L.$),o.push(L._$),M=u[r[r.length-2]][r[r.length-1]],r.push(M);break;case 3:return!0}}return!0}},$=e("lib/parser/nodes"),J=function(){var e={EOF:1,parseError:function(t,n){if(!this.yy.parser)throw new Error(t);this.yy.parser.parseError(t,n)},setInput:function(e,t){return this.yy=t||this.yy||{},this._input=e,this._more=this._backtrack=this.done=!1,this.yylineno=this.yyleng=0,this.yytext=this.matched=this.match="",this.conditionStack=["INITIAL"],this.yylloc={first_line:1,first_column:0,last_line:1,last_column:0},this.options.ranges&&(this.yylloc.range=[0,0]),this.offset=0,this},input:function(){var e=this._input[0];this.yytext+=e,this.yyleng++,this.offset++,this.match+=e,this.matched+=e;var t=e.match(/(?:\r\n?|\n).*/g);return t?(this.yylineno++,this.yylloc.last_line++):this.yylloc.last_column++,this.options.ranges&&this.yylloc.range[1]++,this._input=this._input.slice(1),e},unput:function(e){var t=e.length,n=e.split(/(?:\r\n?|\n)/g);this._input=e+this._input,this.yytext=this.yytext.substr(0,this.yytext.length-t),this.offset-=t;var r=this.match.split(/(?:\r\n?|\n)/g);this.match=this.match.substr(0,this.match.length-1),this.matched=this.matched.substr(0,this.matched.length-1),n.length-1&&(this.yylineno-=n.length-1);var i=this.yylloc.range;return this.yylloc={first_line:this.yylloc.first_line,last_line:this.yylineno+1,first_column:this.yylloc.first_column,last_column:n?(n.length===r.length?this.yylloc.first_column:0)+r[r.length-n.length].length-n[0].length:this.yylloc.first_column-t},this.options.ranges&&(this.yylloc.range=[i[0],i[0]+this.yyleng-t]),this.yyleng=this.yytext.length,this},more:function(){return this._more=!0,this},reject:function(){return this.options.backtrack_lexer?(this._backtrack=!0,this):this.parseError("Lexical error on line "+(this.yylineno+1)+". You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).\n"+this.showPosition(),{text:"",token:null,line:this.yylineno})},less:function(e){this.unput(this.match.slice(e))},pastInput:function(){var e=this.matched.substr(0,this.matched.length-this.match.length);return(e.length>20?"...":"")+e.substr(-20).replace(/\n/g,"")},upcomingInput:function(){var e=this.match;return e.length<20&&(e+=this._input.substr(0,20-e.length)),(e.substr(0,20)+(e.length>20?"...":"")).replace(/\n/g,"")},showPosition:function(){var e=this.pastInput(),t=(new Array(e.length+1)).join("-");return e+this.upcomingInput()+"\n"+t+"^"},test_match:function(e,t){var n,r,i;this.options.backtrack_lexer&&(i={yylineno:this.yylineno,yylloc:{first_line:this.yylloc.first_line,last_line:this.last_line,first_column:this.yylloc.first_column,last_column:this.yylloc.last_column},yytext:this.yytext,match:this.match,matches:this.matches,matched:this.matched,yyleng:this.yyleng,offset:this.offset,_more:this._more,_input:this._input,yy:this.yy,conditionStack:this.conditionStack.slice(0),done:this.done},this.options.ranges&&(i.yylloc.range=this.yylloc.range.slice(0))),r=e[0].match(/(?:\r\n?|\n).*/g),r&&(this.yylineno+=r.length),this.yylloc={first_line:this.yylloc.last_line,last_line:this.yylineno+1,first_column:this.yylloc.last_column,last_column:r?r[r.length-1].length-r[r.length-1].match(/\r?\n?/)[0].length:this.yylloc.last_column+e[0].length},this.yytext+=e[0],this.match+=e[0],this.matches=e,this.yyleng=this.yytext.length,this.options.ranges&&(this.yylloc.range=[this.offset,this.offset+=this.yyleng]),this._more=!1,this._backtrack=!1,this._input=this._input.slice(e[0].length),this.matched+=e[0],n=this.performAction.call(this,this.yy,this,t,this.conditionStack[this.conditionStack.length-1]),this.done&&this._input&&(this.done=!1);if(n)return n;if(this._backtrack){for(var s in i)this[s]=i[s];return!1}return!1},next:function(){if(this.done)return this.EOF;this._input||(this.done=!0);var e,t,n,r;this._more||(this.yytext="",this.match="");var i=this._currentRules();for(var s=0;s<i.length;s++){n=this._input.match(this.rules[i[s]]);if(n&&(!t||n[0].length>t[0].length)){t=n,r=s;if(this.options.backtrack_lexer){e=this.test_match(n,i[s]);if(e!==!1)return e;if(this._backtrack){t=!1;continue}return!1}if(!this.options.flex)break}}return t?(e=this.test_match(t,i[r]),e!==!1?e:!1):this._input===""?this.EOF:this.parseError("Lexical error on line "+(this.yylineno+1)+". Unrecognized text.\n"+this.showPosition(),{text:"",token:null,line:this.yylineno})},lex:function(){var t=this.next();return t?t:this.lex()},begin:function(t){this.conditionStack.push(t)},popState:function(){var t=this.conditionStack.length-1;return t>0?this.conditionStack.pop():this.conditionStack[0]},_currentRules:function(){return this.conditionStack.length&&this.conditionStack[this.conditionStack.length-1]?this.conditions[this.conditionStack[this.conditionStack.length-1]].rules:this.conditions.INITIAL.rules},topState:function(t){return t=this.conditionStack.length-1-Math.abs(t||0),t>=0?this.conditionStack[t]:"INITIAL"},pushState:function(t){this.begin(t)},stateStackSize:function(){return this.conditionStack.length},options:{},performAction:function(t,n,r,i){var s=i;switch(r){case 0:break;case 1:break;case 2:break;case 3:return 22;case 4:return"INVALID";case 5:return 25;case 6:return 18;case 7:return 21;case 8:return"while";case 9:return"for";case 10:return"case";case 11:return"default";case 12:return"new";case 13:return"break";case 14:return"continue";case 15:return 26;case 16:return 36;case 17:return 27;case 18:return 8;case 19:return 9;case 20:return 15;case 21:return 55;case 22:return 51;case 23:return 52;case 24:return 53;case 25:return"[";case 26:return"]";case 27:return 42;case 28:this.begin("DoubleQuotedString"),this.string="";break;case 29:this.begin("SingleQuotedString"),this.string="";break;case 30:this.begin("QuotedStringEscape");break;case 31:return n.yytext=this.string,this.string=undefined,this.popState(),48;case 32:return n.yytext=this.string,this.string=undefined,this.popState(),48;case 33:switch(n.yytext){case"\r\n":case"\n":break;case"b":this.string+="\b";break;case"n":this.string+="\n";break;case"r":this.string+="\r";break;case"t":this.string+="	";break;case"'":this.string+="'";break;case'"':this.string+='"';break;case"\\":this.string+="\\";break;default:this.string+="\\"+$1}this.popState();break;case 34:this.string+=n.yytext;break;case 35:this.string+=n.yytext;break;case 36:return 57;case 37:return 49;case 38:return 50;case 39:return 28;case 40:return 29;case 41:return 30;case 42:return 31;case 43:return 32;case 44:return 37;case 45:return 41;case 46:return 40;case 47:return 39;case 48:return 38;case 49:return 33;case 50:return 34;case 51:return 35;case 52:return 19;case 53:return 20;case 54:return 46;case 55:return 47;case 56:return 5;case 57:return"INVALID"}},rules:[/^(?:\/\/([^\n\r]*))/,/^(?:\/\*([\u0000-\uffff]*?)\*\/)/,/^(?:\s+)/,/^(?:function\b)/,/^(?:return\s*\n)/,/^(?:return\b)/,/^(?:if\b)/,/^(?:else\b)/,/^(?:while\b)/,/^(?:for\b)/,/^(?:case\b)/,/^(?:default\b)/,/^(?:new\b)/,/^(?:break\b)/,/^(?:continue\b)/,/^(?:var\b)/,/^(?:===)/,/^(?:=)/,/^(?:\{)/,/^(?:\})/,/^(?:;)/,/^(?:,)/,/^(?:true\b)/,/^(?:false\b)/,/^(?:\[\])/,/^(?:\[)/,/^(?:\])/,/^(?:\.)/,/^(?:")/,/^(?:')/,/^(?:\\)/,/^(?:")/,/^(?:')/,/^(?:(.|\r\n|\n))/,/^(?:[^"\\]*)/,/^(?:[^'\\]*)/,/^(?:[A-Za-z_][A-Za-z0-9_]*)/,/^(?:[0-9]+(\.[0-9]+)?([eE][\-+]?[0-9]+)?\b)/,/^(?:[0-9]+\b)/,/^(?:\+)/,/^(?:-)/,/^(?:\*)/,/^(?:\/)/,/^(?:%)/,/^(?:!==)/,/^(?:<=)/,/^(?:>=)/,/^(?:<)/,/^(?:>)/,/^(?:!)/,/^(?:&&)/,/^(?:\|\|)/,/^(?:\()/,/^(?:\))/,/^(?:\?)/,/^(?::)/,/^(?:$)/,/^(?:.)/],conditions:{QuotedStringEscape:{rules:[33],inclusive:!1},SingleQuotedString:{rules:[30,32,35],inclusive:!1},DoubleQuotedString:{rules:[30,31,34],inclusive:!1},INITIAL:{rules:[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57],inclusive:!0}}};return e}();return V.lexer=J,V.lexer.options.ranges=!0,V}),n("lib/parser/parser-week-4.js",["require","lib/parser/nodes"],function(e){var t=function(e,t,n,r){for(n=n||{},r=e.length;r--;n[e[r]]=t);return n},n=[1,6],r=[1,13],i=[1,14],s=[1,21],o=[1,15],u=[1,16],a=[1,17],f=[1,19],l=[1,18],c=[1,20],h=[1,25],p=[1,26],d=[1,27],v=[1,28],m=[1,29],g=[1,30],y=[1,31],b=[5,9],w=[5,9,15,18,19,22,25,26,28,29,33,48,49,50,51,52,53,57],E=[1,41],S=[1,42],x=[1,43],T=[1,44],N=[1,45],C=[1,46],k=[1,47],L=[1,48],A=[1,49],O=[1,50],M=[1,51],_=[1,52],D=[1,53],P=[1,54],H=[1,55],B=[1,58],j=[1,60],F=[15,20,28,29,30,31,32,34,35,36,37,38,39,40,41,42,46,47,55],I=[5,9,15,18,19,20,21,22,25,26,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,46,47,48,49,50,51,52,53,55,57],q=[2,64],R=[15,20,28,29,30,31,32,34,35,36,37,38,39,40,41,46,47,55],U=[2,60],z=[15,20,28,29,34,35,36,37,38,39,40,41,46,47,55],W=[15,20,34,35,36,37,46,47,55],X=[15,20,34,35,36,37,38,39,40,41,46,47,55],V={trace:function(){},yy:{},symbols_:{error:2,program:3,statements:4,EOF:5,statement_block:6,empty_block:7,"{":8,"}":9,non_empty_statements:10,statement:11,if_statement:12,function_definition:13,return_statement:14,";":15,variable_definition:16,expression:17,"if":18,"(":19,")":20,"else":21,"function":22,identifier:23,identifiers:24,"return":25,"var":26,"=":27,"+":28,"-":29,"*":30,"/":31,"%":32,"!":33,"&&":34,"||":35,"===":36,"!==":37,">":38,"<":39,">=":40,"<=":41,".":42,constants:43,expressions:44,function_expression:45,"?":46,":":47,STRING:48,FLOAT_NUMBER:49,INT_NUMBER:50,"true":51,"false":52,empty_list:53,non_empty_expressions:54,",":55,non_empty_identifiers:56,Identifier:57,$accept:0,$end:1},terminals_:{2:"error",5:"EOF",8:"{",9:"}",15:";",18:"if",19:"(",20:")",21:"else",22:"function",25:"return",26:"var",27:"=",28:"+",29:"-",30:"*",31:"/",32:"%",33:"!",34:"&&",35:"||",36:"===",37:"!==",38:">",39:"<",40:">=",41:"<=",42:".",46:"?",47:":",48:"STRING",49:"FLOAT_NUMBER",50:"INT_NUMBER",51:"true",52:"false",53:"empty_list",55:",",57:"Identifier"},productions_:[0,[3,2],[3,2],[3,2],[7,2],[6,3],[4,0],[4,1],[10,2],[10,1],[11,1],[11,1],[11,2],[11,2],[11,2],[11,1],[12,7],[12,7],[12,7],[12,7],[12,7],[12,7],[13,6],[13,6],[14,2],[16,4],[17,3],[17,3],[17,3],[17,3],[17,3],[17,2],[17,2],[17,2],[17,3],[17,3],[17,3],[17,3],[17,3],[17,3],[17,3],[17,3],[17,3],[17,3],[17,1],[17,1],[17,6],[17,4],[17,6],[17,1],[17,5],[43,1],[43,1],[43,1],[43,1],[43,1],[43,1],[45,5],[45,5],[44,1],[44,0],[54,3],[54,1],[24,1],[24,0],[56,3],[56,1],[23,1]],performAction:function(t,n,r,i,s,o,u){var a=o.length-1;switch(s){case 1:case 2:case 3:return o[a-1];case 4:this.$=[];break;case 5:case 43:this.$=o[a-1];break;case 6:case 60:case 64:this.$=[];break;case 8:o[a-1]===$.no_op()?this.$=o[a]:this.$=$.pair(o[a-1],o[a]);break;case 9:o[a]===$.no_op()?this.$=[]:this.$=$.pair(o[a],[]);break;case 15:this.$=$.no_op();break;case 16:case 17:case 18:case 19:this.$=$.if_statement(o[a-4],o[a-2],o[a],r);break;case 20:case 21:this.$=$.if_statement(o[a-4],o[a-2],$.pair(o[a],[]),r);break;case 22:case 23:this.$=$.variable_definition(o[a-4],$.function_definition(o[a-4],o[a-2],o[a],u[a-5],u[a]),r);break;case 24:this.$=$.return_statement(o[a],r);break;case 25:this.$=$.variable_definition(o[a-2],o[a],r);break;case 26:case 27:case 28:case 29:case 30:case 36:case 37:case 38:case 39:case 40:case 41:this.$=$.eager_binary_expression(o[a-2],o[a-1],o[a],r);break;case 31:case 32:this.$=$.eager_binary_expression(0,o[a-1],o[a],r);break;case 33:this.$=$.eager_unary_expression(o[a-1],o[a],r);break;case 34:case 35:this.$=$.boolean_operation(o[a-2],o[a-1],o[a],r);break;case 42:this.$=$.property_access(o[a-2],o[a],r);break;case 45:this.$=$.variable(o[a],r);break;case 46:this.$=$.application(o[a-4],o[a-1],r);break;case 47:this.$=$.application($.variable(o[a-3],r),o[a-1],r);break;case 48:this.$=$.object_method_application(o[a-5],o[a-3],o[a-1],r);break;case 50:this.$=$.ternary(o[a-4],o[a-2],o[a],r);break;case 51:case 67:this.$=t;break;case 52:this.$=parseFloat(t);break;case 53:this.$=parseInt(t,10);break;case 54:this.$=!0;break;case 55:this.$=!1;break;case 56:this.$=$.empty_list(r);break;case 57:case 58:this.$=$.function_definition("lambda",o[a-2],o[a],u[a-4],u[a]);break;case 59:case 63:this.$=o[a];break;case 61:case 65:this.$=$.pair(o[a-2],o[a]);break;case 62:case 66:this.$=$.pair(o[a],[])}},table:[{3:1,4:2,5:[2,6],6:3,7:4,8:n,10:5,11:7,12:8,13:9,14:10,15:r,16:11,17:12,18:i,19:s,22:o,23:23,25:u,26:a,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},{1:[3]},{5:[1,32]},{5:[1,33]},{5:[1,34]},{5:[2,7]},{9:[1,36],10:35,11:7,12:8,13:9,14:10,15:r,16:11,17:12,18:i,19:s,22:o,23:23,25:u,26:a,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},t(b,[2,9],{11:7,12:8,13:9,14:10,16:11,17:12,43:22,23:23,45:24,10:37,15:r,18:i,19:s,22:o,25:u,26:a,28:f,29:l,33:c,48:h,49:p,50:d,51:v,52:m,53:g,57:y}),t(w,[2,10]),t(w,[2,11]),{15:[1,38]},{15:[1,39]},{15:[1,40],28:E,29:S,30:x,31:T,32:N,34:C,35:k,36:L,37:A,38:O,39:M,40:_,41:D,42:P,46:H},t(w,[2,15]),{19:[1,56]},{19:B,23:57,57:y},{17:59,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},{23:61,57:y},{17:62,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},{17:63,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},{17:64,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},{17:65,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},t(F,[2,44]),t(F,[2,45],{19:[1,66]}),t(F,[2,49]),t(F,[2,51]),t(F,[2,52]),t(F,[2,53]),t(F,[2,54]),t(F,[2,55]),t(F,[2,56]),t([15,19,20,27,28,29,30,31,32,34,35,36,37,38,39,40,41,42,46,47,55],[2,67]),{1:[2,1]},{1:[2,2]},{1:[2,3]},{9:[1,67]},t(I,[2,4]),t(b,[2,8]),t(w,[2,12]),t(w,[2,13]),t(w,[2,14]),{17:68,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},{17:69,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},{17:70,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},{17:71,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},{17:72,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},{17:73,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},{17:74,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},{17:75,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},{17:76,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},{17:77,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},{17:78,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},{17:79,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},{17:80,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},{23:81,57:y},{17:82,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},{17:83,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},{19:[1,84]},{20:q,23:87,24:85,56:86,57:y},{15:[2,24],28:E,29:S,30:x,31:T,32:N,34:C,35:k,36:L,37:A,38:O,39:M,40:_,41:D,42:P,46:H},{19:B},{27:[1,88]},t(R,[2,31],{42:P}),t(R,[2,32],{42:P}),t(R,[2,33],{42:P}),{20:[1,89],28:E,29:S,30:x,31:T,32:N,34:C,35:k,36:L,37:A,38:O,39:M,40:_,41:D,42:P,46:H},{17:92,19:s,20:U,22:j,23:23,28:f,29:l,33:c,43:22,44:90,45:24,48:h,49:p,50:d,51:v,52:m,53:g,54:91,57:y},t(I,[2,5]),t(z,[2,26],{30:x,31:T,32:N,42:P}),t(z,[2,27],{30:x,31:T,32:N,42:P}),t(R,[2,28],{42:P}),t(R,[2,29],{42:P}),t(R,[2,30],{42:P}),t([15,20,34,35,46,47,55],[2,34],{28:E,29:S,30:x,31:T,32:N,36:L,37:A,38:O,39:M,40:_,41:D,42:P}),t([15,20,35,46,47,55],[2,35],{28:E,29:S,30:x,31:T,32:N,34:C,36:L,37:A,38:O,39:M,40:_,41:D,42:P}),t(W,[2,36],{28:E,29:S,30:x,31:T,32:N,38:O,39:M,40:_,41:D,42:P}),t(W,[2,37],{28:E,29:S,30:x,31:T,32:N,38:O,39:M,40:_,41:D,42:P}),t(X,[2,38],{28:E,29:S,30:x,31:T,32:N,42:P}),t(X,[2,39],{28:E,29:S,30:x,31:T,32:N,42:P}),t(X,[2,40],{28:E,29:S,30:x,31:T,32:N,42:P}),t(X,[2,41],{28:E,29:S,30:x,31:T,32:N,42:P}),t(F,[2,42],{19:[1,93]}),{28:E,29:S,30:x,31:T,32:N,34:C,35:k,36:L,37:A,38:O,39:M,40:_,41:D,42:P,46:H,47:[1,94]},{20:[1,95],28:E,29:S,30:x,31:T,32:N,34:C,35:k,36:L,37:A,38:O,39:M,40:_,41:D,42:P,46:H},{20:q,23:87,24:96,56:86,57:y},{20:[1,97]},{20:[2,63]},{20:[2,66],55:[1,98]},{17:99,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},t(F,[2,43],{19:[1,100]}),{20:[1,101]},{20:[2,59]},{20:[2,62],28:E,29:S,30:x,31:T,32:N,34:C,35:k,36:L,37:A,38:O,39:M,40:_,41:D,42:P,46:H,55:[1,102]},{17:92,19:s,20:U,22:j,23:23,28:f,29:l,33:c,43:22,44:103,45:24,48:h,49:p,50:d,51:v,52:m,53:g,54:91,57:y},{17:104,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},{6:105,7:106,8:n},{20:[1,107]},{6:108,7:109,8:n},{23:87,56:110,57:y},{15:[2,25],28:E,29:S,30:x,31:T,32:N,34:C,35:k,36:L,37:A,38:O,39:M,40:_,41:D,42:P,46:H},{17:92,19:s,20:U,22:j,23:23,28:f,29:l,33:c,43:22,44:111,45:24,48:h,49:p,50:d,51:v,52:m,53:g,54:91,57:y},t(F,[2,47]),{17:92,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,54:112,57:y},{20:[1,113]},t([15,20,47,55],[2,50],{28:E,29:S,30:x,31:T,32:N,34:C,35:k,36:L,37:A,38:O,39:M,40:_,41:D,42:P,46:H}),{21:[1,114]},{21:[1,115]},{6:116,7:117,8:n},t(F,[2,57]),t(F,[2,58]),{20:[2,65]},{20:[1,118]},{20:[2,61]},t(F,[2,48]),{6:119,7:120,8:n,12:121,18:i},{6:122,7:123,8:n,12:124,18:i},t(w,[2,22]),t(w,[2,23]),t(F,[2,46]),t(w,[2,16]),t(w,[2,17]),t(w,[2,20]),t(w,[2,18]),t(w,[2,19]),t(w,[2,21])],defaultActions:{5:[2,7],32:[2,1],33:[2,2],34:[2,3],86:[2,63],91:[2,59],110:[2,65],112:[2,61]},parseError:function(t,n){if(!n.recoverable){function r(e,t){this.message=e,this.hash=t}throw r.prototype=new Error,new r(t,n)}this.trace(t)},parse:function(t){function w(e){r.length=r.length-2*e,s.length=s.length-e,o.length=o.length-e}var n=this,r=[0],i=[],s=[null],o=[],u=this.table,a="",f=0,l=0,c=0,h=2,p=1,d=o.slice.call(arguments,1),v=Object.create(this.lexer),m={yy:{}};for(var g in this.yy)Object.prototype.hasOwnProperty.call(this.yy,g)&&(m.yy[g]=this.yy[g]);v.setInput(t,m.yy),m.yy.lexer=v,m.yy.parser=this,typeof v.yylloc=="undefined"&&(v.yylloc={});var y=v.yylloc;o.push(y);var b=v.options&&v.options.ranges;typeof m.yy.parseError=="function"?this.parseError=m.yy.parseError:this.parseError=Object.getPrototypeOf(this).parseError;function E(){var e;return e=v.lex()||p,typeof e!="number"&&(e=n.symbols_[e]||e),e}var S,x,T,N,C,k,L={},A,O,M,_;for(;;){T=r[r.length-1];if(this.defaultActions[T])N=this.defaultActions[T];else{if(S===null||typeof S=="undefined")S=E();N=u[T]&&u[T][S]}if(typeof N=="undefined"||!N.length||!N[0]){var D="";_=[];for(A in u[T])this.terminals_[A]&&A>h&&_.push("'"+this.terminals_[A]+"'");v.showPosition?D="Parse error on line "+(f+1)+":\n"+v.showPosition()+"\nExpecting "+_.join(", ")+", got '"+(this.terminals_[S]||S)+"'":D="Parse error on line "+(f+1)+": Unexpected "+(S==p?"end of input":"'"+(this.terminals_[S]||S)+"'"),this.parseError(D,{text:v.match,token:this.terminals_[S]||S,line:v.yylineno,loc:y,expected:_})}if(N[0]instanceof Array&&N.length>1)throw new Error("Parse Error: multiple actions possible at state: "+T+", token: "+S);switch(N[0]){case 1:r.push(S),s.push(v.yytext),o.push(v.yylloc),r.push(N[1]),S=null,x?(S=x,x=null):(l=v.yyleng,a=v.yytext,f=v.yylineno,y=v.yylloc,c>0&&c--);break;case 2:O=this.productions_[N[1]][1],L.$=s[s.length-O],L._$={first_line:o[o.length-(O||1)].first_line,last_line:o[o.length-1].last_line,first_column:o[o.length-(O||1)].first_column,last_column:o[o.length-1].last_column},b&&(L._$.range=[o[o.length-(O||1)].range[0],o[o.length-1].range[1]]),k=this.performAction.apply(L,[a,l,f,m.yy,N[1],s,o].concat(d));if(typeof k!="undefined")return k;O&&(r=r.slice(0,-1*O*2),s=s.slice(0,-1*O),o=o.slice(0,-1*O)),r.push(this.productions_[N[1]][0]),s.push(L.$),o.push(L._$),M=u[r[r.length-2]][r[r.length-1]],r.push(M);break;case 3:return!0}}return!0}},$=e("lib/parser/nodes"),J=function(){var e={EOF:1,parseError:function(t,n){if(!this.yy.parser)throw new Error(t);this.yy.parser.parseError(t,n)},setInput:function(e,t){return this.yy=t||this.yy||{},this._input=e,this._more=this._backtrack=this.done=!1,this.yylineno=this.yyleng=0,this.yytext=this.matched=this.match="",this.conditionStack=["INITIAL"],this.yylloc={first_line:1,first_column:0,last_line:1,last_column:0},this.options.ranges&&(this.yylloc.range=[0,0]),this.offset=0,this},input:function(){var e=this._input[0];this.yytext+=e,this.yyleng++,this.offset++,this.match+=e,this.matched+=e;var t=e.match(/(?:\r\n?|\n).*/g);return t?(this.yylineno++,this.yylloc.last_line++):this.yylloc.last_column++,this.options.ranges&&this.yylloc.range[1]++,this._input=this._input.slice(1),e},unput:function(e){var t=e.length,n=e.split(/(?:\r\n?|\n)/g);this._input=e+this._input,this.yytext=this.yytext.substr(0,this.yytext.length-t),this.offset-=t;var r=this.match.split(/(?:\r\n?|\n)/g);this.match=this.match.substr(0,this.match.length-1),this.matched=this.matched.substr(0,this.matched.length-1),n.length-1&&(this.yylineno-=n.length-1);var i=this.yylloc.range;return this.yylloc={first_line:this.yylloc.first_line,last_line:this.yylineno+1,first_column:this.yylloc.first_column,last_column:n?(n.length===r.length?this.yylloc.first_column:0)+r[r.length-n.length].length-n[0].length:this.yylloc.first_column-t},this.options.ranges&&(this.yylloc.range=[i[0],i[0]+this.yyleng-t]),this.yyleng=this.yytext.length,this},more:function(){return this._more=!0,this},reject:function(){return this.options.backtrack_lexer?(this._backtrack=!0,this):this.parseError("Lexical error on line "+(this.yylineno+1)+". You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).\n"+this.showPosition(),{text:"",token:null,line:this.yylineno})},less:function(e){this.unput(this.match.slice(e))},pastInput:function(){var e=this.matched.substr(0,this.matched.length-this.match.length);return(e.length>20?"...":"")+e.substr(-20).replace(/\n/g,"")},upcomingInput:function(){var e=this.match;return e.length<20&&(e+=this._input.substr(0,20-e.length)),(e.substr(0,20)+(e.length>20?"...":"")).replace(/\n/g,"")},showPosition:function(){var e=this.pastInput(),t=(new Array(e.length+1)).join("-");return e+this.upcomingInput()+"\n"+t+"^"},test_match:function(e,t){var n,r,i;this.options.backtrack_lexer&&(i={yylineno:this.yylineno,yylloc:{first_line:this.yylloc.first_line,last_line:this.last_line,first_column:this.yylloc.first_column,last_column:this.yylloc.last_column},yytext:this.yytext,match:this.match,matches:this.matches,matched:this.matched,yyleng:this.yyleng,offset:this.offset,_more:this._more,_input:this._input,yy:this.yy,conditionStack:this.conditionStack.slice(0),done:this.done},this.options.ranges&&(i.yylloc.range=this.yylloc.range.slice(0))),r=e[0].match(/(?:\r\n?|\n).*/g),r&&(this.yylineno+=r.length),this.yylloc={first_line:this.yylloc.last_line,last_line:this.yylineno+1,first_column:this.yylloc.last_column,last_column:r?r[r.length-1].length-r[r.length-1].match(/\r?\n?/)[0].length:this.yylloc.last_column+e[0].length},this.yytext+=e[0],this.match+=e[0],this.matches=e,this.yyleng=this.yytext.length,this.options.ranges&&(this.yylloc.range=[this.offset,this.offset+=this.yyleng]),this._more=!1,this._backtrack=!1,this._input=this._input.slice(e[0].length),this.matched+=e[0],n=this.performAction.call(this,this.yy,this,t,this.conditionStack[this.conditionStack.length-1]),this.done&&this._input&&(this.done=!1);if(n)return n;if(this._backtrack){for(var s in i)this[s]=i[s];return!1}return!1},next:function(){if(this.done)return this.EOF;this._input||(this.done=!0);var e,t,n,r;this._more||(this.yytext="",this.match="");var i=this._currentRules();for(var s=0;s<i.length;s++){n=this._input.match(this.rules[i[s]]);if(n&&(!t||n[0].length>t[0].length)){t=n,r=s;if(this.options.backtrack_lexer){e=this.test_match(n,i[s]);if(e!==!1)return e;if(this._backtrack){t=!1;continue}return!1}if(!this.options.flex)break}}return t?(e=this.test_match(t,i[r]),e!==!1?e:!1):this._input===""?this.EOF:this.parseError("Lexical error on line "+(this.yylineno+1)+". Unrecognized text.\n"+this.showPosition(),{text:"",token:null,line:this.yylineno})},lex:function(){var t=this.next();return t?t:this.lex()},begin:function(t){this.conditionStack.push(t)},popState:function(){var t=this.conditionStack.length-1;return t>0?this.conditionStack.pop():this.conditionStack[0]},_currentRules:function(){return this.conditionStack.length&&this.conditionStack[this.conditionStack.length-1]?this.conditions[this.conditionStack[this.conditionStack.length-1]].rules:this.conditions.INITIAL.rules},topState:function(t){return t=this.conditionStack.length-1-Math.abs(t||0),t>=0?this.conditionStack[t]:"INITIAL"},pushState:function(t){this.begin(t)},stateStackSize:function(){return this.conditionStack.length},options:{},performAction:function(t,n,r,i){var s=i;switch(r){case 0:break;case 1:break;case 2:break;case 3:return 22;case 4:return"INVALID";case 5:return 25;case 6:return 18;case 7:return 21;case 8:return"while";case 9:return"for";case 10:return"case";case 11:return"default";case 12:return"new";case 13:return"break";case 14:return"continue";case 15:return 26;case 16:return 36;case 17:return 27;case 18:return 8;case 19:return 9;case 20:return 15;case 21:return 55;case 22:return 51;case 23:return 52;case 24:return 53;case 25:return"[";case 26:return"]";case 27:return 42;case 28:this.begin("DoubleQuotedString"),this.string="";break;case 29:this.begin("SingleQuotedString"),this.string="";break;case 30:this.begin("QuotedStringEscape");break;case 31:return n.yytext=this.string,this.string=undefined,this.popState(),48;case 32:return n.yytext=this.string,this.string=undefined,this.popState(),48;case 33:switch(n.yytext){case"\r\n":case"\n":break;case"b":this.string+="\b";break;case"n":this.string+="\n";break;case"r":this.string+="\r";break;case"t":this.string+="	";break;case"'":this.string+="'";break;case'"':this.string+='"';break;case"\\":this.string+="\\";break;default:this.string+="\\"+$1}this.popState();break;case 34:this.string+=n.yytext;break;case 35:this.string+=n.yytext;break;case 36:return 57;case 37:return 49;case 38:return 50;case 39:return 28;case 40:return 29;case 41:return 30;case 42:return 31;case 43:return 32;case 44:return 37;case 45:return 41;case 46:return 40;case 47:return 39;case 48:return 38;case 49:return 33;case 50:return 34;case 51:return 35;case 52:return 19;case 53:return 20;case 54:return 46;case 55:return 47;case 56:return 5;case 57:return"INVALID"}},rules:[/^(?:\/\/([^\n\r]*))/,/^(?:\/\*([\u0000-\uffff]*?)\*\/)/,/^(?:\s+)/,/^(?:function\b)/,/^(?:return\s*\n)/,/^(?:return\b)/,/^(?:if\b)/,/^(?:else\b)/,/^(?:while\b)/,/^(?:for\b)/,/^(?:case\b)/,/^(?:default\b)/,/^(?:new\b)/,/^(?:break\b)/,/^(?:continue\b)/,/^(?:var\b)/,/^(?:===)/,/^(?:=)/,/^(?:\{)/,/^(?:\})/,/^(?:;)/,/^(?:,)/,/^(?:true\b)/,/^(?:false\b)/,/^(?:\[\])/,/^(?:\[)/,/^(?:\])/,/^(?:\.)/,/^(?:")/,/^(?:')/,/^(?:\\)/,/^(?:")/,/^(?:')/,/^(?:(.|\r\n|\n))/,/^(?:[^"\\]*)/,/^(?:[^'\\]*)/,/^(?:[A-Za-z_][A-Za-z0-9_]*)/,/^(?:[0-9]+(\.[0-9]+)?([eE][\-+]?[0-9]+)?\b)/,/^(?:[0-9]+\b)/,/^(?:\+)/,/^(?:-)/,/^(?:\*)/,/^(?:\/)/,/^(?:%)/,/^(?:!==)/,/^(?:<=)/,/^(?:>=)/,/^(?:<)/,/^(?:>)/,/^(?:!)/,/^(?:&&)/,/^(?:\|\|)/,/^(?:\()/,/^(?:\))/,/^(?:\?)/,/^(?::)/,/^(?:$)/,/^(?:.)/],conditions:{QuotedStringEscape:{rules:[33],inclusive:!1},SingleQuotedString:{rules:[30,32,35],inclusive:!1},DoubleQuotedString:{rules:[30,31,34],inclusive:!1},INITIAL:{rules:[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57],inclusive:!0}}};return e}();return V.lexer=J,V.lexer.options.ranges=!0,V}),n("lib/parser/parser-week-5.js",["require","lib/parser/nodes"],function(e){var t=function(e,t,n,r){for(n=n||{},r=e.length;r--;n[e[r]]=t);return n},n=[1,6],r=[1,13],i=[1,14],s=[1,21],o=[1,15],u=[1,16],a=[1,17],f=[1,19],l=[1,18],c=[1,20],h=[1,25],p=[1,26],d=[1,27],v=[1,28],m=[1,29],g=[1,30],y=[1,31],b=[5,9],w=[5,9,15,18,19,22,25,26,28,29,33,48,49,50,51,52,53,57],E=[1,41],S=[1,42],x=[1,43],T=[1,44],N=[1,45],C=[1,46],k=[1,47],L=[1,48],A=[1,49],O=[1,50],M=[1,51],_=[1,52],D=[1,53],P=[1,54],H=[1,55],B=[1,58],j=[1,60],F=[15,20,28,29,30,31,32,34,35,36,37,38,39,40,41,42,46,47,55],I=[5,9,15,18,19,20,21,22,25,26,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,46,47,48,49,50,51,52,53,55,57],q=[2,64],R=[15,20,28,29,30,31,32,34,35,36,37,38,39,40,41,46,47,55],U=[2,60],z=[15,20,28,29,34,35,36,37,38,39,40,41,46,47,55],W=[15,20,34,35,36,37,46,47,55],X=[15,20,34,35,36,37,38,39,40,41,46,47,55],V={trace:function(){},yy:{},symbols_:{error:2,program:3,statements:4,EOF:5,statement_block:6,empty_block:7,"{":8,"}":9,non_empty_statements:10,statement:11,if_statement:12,function_definition:13,return_statement:14,";":15,variable_definition:16,expression:17,"if":18,"(":19,")":20,"else":21,"function":22,identifier:23,identifiers:24,"return":25,"var":26,"=":27,"+":28,"-":29,"*":30,"/":31,"%":32,"!":33,"&&":34,"||":35,"===":36,"!==":37,">":38,"<":39,">=":40,"<=":41,".":42,constants:43,expressions:44,function_expression:45,"?":46,":":47,STRING:48,FLOAT_NUMBER:49,INT_NUMBER:50,"true":51,"false":52,empty_list:53,non_empty_expressions:54,",":55,non_empty_identifiers:56,Identifier:57,$accept:0,$end:1},terminals_:{2:"error",5:"EOF",8:"{",9:"}",15:";",18:"if",19:"(",20:")",21:"else",22:"function",25:"return",26:"var",27:"=",28:"+",29:"-",30:"*",31:"/",32:"%",33:"!",34:"&&",35:"||",36:"===",37:"!==",38:">",39:"<",40:">=",41:"<=",42:".",46:"?",47:":",48:"STRING",49:"FLOAT_NUMBER",50:"INT_NUMBER",51:"true",52:"false",53:"empty_list",55:",",57:"Identifier"},productions_:[0,[3,2],[3,2],[3,2],[7,2],[6,3],[4,0],[4,1],[10,2],[10,1],[11,1],[11,1],[11,2],[11,2],[11,2],[11,1],[12,7],[12,7],[12,7],[12,7],[12,7],[12,7],[13,6],[13,6],[14,2],[16,4],[17,3],[17,3],[17,3],[17,3],[17,3],[17,2],[17,2],[17,2],[17,3],[17,3],[17,3],[17,3],[17,3],[17,3],[17,3],[17,3],[17,3],[17,3],[17,1],[17,1],[17,6],[17,4],[17,6],[17,1],[17,5],[43,1],[43,1],[43,1],[43,1],[43,1],[43,1],[45,5],[45,5],[44,1],[44,0],[54,3],[54,1],[24,1],[24,0],[56,3],[56,1],[23,1]],performAction:function(t,n,r,i,s,o,u){var a=o.length-1;switch(s){case 1:case 2:case 3:return o[a-1];case 4:this.$=[];break;case 5:case 43:this.$=o[a-1];break;case 6:case 60:case 64:this.$=[];break;case 8:o[a-1]===$.no_op()?this.$=o[a]:this.$=$.pair(o[a-1],o[a]);break;case 9:o[a]===$.no_op()?this.$=[]:this.$=$.pair(o[a],[]);break;case 15:this.$=$.no_op();break;case 16:case 17:case 18:case 19:this.$=$.if_statement(o[a-4],o[a-2],o[a],r);break;case 20:case 21:this.$=$.if_statement(o[a-4],o[a-2],$.pair(o[a],[]),r);break;case 22:case 23:this.$=$.variable_definition(o[a-4],$.function_definition(o[a-4],o[a-2],o[a],u[a-5],u[a]),r);break;case 24:this.$=$.return_statement(o[a],r);break;case 25:this.$=$.variable_definition(o[a-2],o[a],r);break;case 26:case 27:case 28:case 29:case 30:case 36:case 37:case 38:case 39:case 40:case 41:this.$=$.eager_binary_expression(o[a-2],o[a-1],o[a],r);break;case 31:case 32:this.$=$.eager_binary_expression(0,o[a-1],o[a],r);break;case 33:this.$=$.eager_unary_expression(o[a-1],o[a],r);break;case 34:case 35:this.$=$.boolean_operation(o[a-2],o[a-1],o[a],r);break;case 42:this.$=$.property_access(o[a-2],o[a],r);break;case 45:this.$=$.variable(o[a],r);break;case 46:this.$=$.application(o[a-4],o[a-1],r);break;case 47:this.$=$.application($.variable(o[a-3],r),o[a-1],r);break;case 48:this.$=$.object_method_application(o[a-5],o[a-3],o[a-1],r);break;case 50:this.$=$.ternary(o[a-4],o[a-2],o[a],r);break;case 51:case 67:this.$=t;break;case 52:this.$=parseFloat(t);break;case 53:this.$=parseInt(t,10);break;case 54:this.$=!0;break;case 55:this.$=!1;break;case 56:this.$=$.empty_list(r);break;case 57:case 58:this.$=$.function_definition("lambda",o[a-2],o[a],u[a-4],u[a]);break;case 59:case 63:this.$=o[a];break;case 61:case 65:this.$=$.pair(o[a-2],o[a]);break;case 62:case 66:this.$=$.pair(o[a],[])}},table:[{3:1,4:2,5:[2,6],6:3,7:4,8:n,10:5,11:7,12:8,13:9,14:10,15:r,16:11,17:12,18:i,19:s,22:o,23:23,25:u,26:a,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},{1:[3]},{5:[1,32]},{5:[1,33]},{5:[1,34]},{5:[2,7]},{9:[1,36],10:35,11:7,12:8,13:9,14:10,15:r,16:11,17:12,18:i,19:s,22:o,23:23,25:u,26:a,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},t(b,[2,9],{11:7,12:8,13:9,14:10,16:11,17:12,43:22,23:23,45:24,10:37,15:r,18:i,19:s,22:o,25:u,26:a,28:f,29:l,33:c,48:h,49:p,50:d,51:v,52:m,53:g,57:y}),t(w,[2,10]),t(w,[2,11]),{15:[1,38]},{15:[1,39]},{15:[1,40],28:E,29:S,30:x,31:T,32:N,34:C,35:k,36:L,37:A,38:O,39:M,40:_,41:D,42:P,46:H},t(w,[2,15]),{19:[1,56]},{19:B,23:57,57:y},{17:59,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},{23:61,57:y},{17:62,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},{17:63,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},{17:64,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},{17:65,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},t(F,[2,44]),t(F,[2,45],{19:[1,66]}),t(F,[2,49]),t(F,[2,51]),t(F,[2,52]),t(F,[2,53]),t(F,[2,54]),t(F,[2,55]),t(F,[2,56]),t([15,19,20,27,28,29,30,31,32,34,35,36,37,38,39,40,41,42,46,47,55],[2,67]),{1:[2,1]},{1:[2,2]},{1:[2,3]},{9:[1,67]},t(I,[2,4]),t(b,[2,8]),t(w,[2,12]),t(w,[2,13]),t(w,[2,14]),{17:68,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},{17:69,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},{17:70,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},{17:71,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},{17:72,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},{17:73,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},{17:74,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},{17:75,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},{17:76,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},{17:77,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},{17:78,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},{17:79,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},{17:80,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},{23:81,57:y},{17:82,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},{17:83,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},{19:[1,84]},{20:q,23:87,24:85,56:86,57:y},{15:[2,24],28:E,29:S,30:x,31:T,32:N,34:C,35:k,36:L,37:A,38:O,39:M,40:_,41:D,42:P,46:H},{19:B},{27:[1,88]},t(R,[2,31],{42:P}),t(R,[2,32],{42:P}),t(R,[2,33],{42:P}),{20:[1,89],28:E,29:S,30:x,31:T,32:N,34:C,35:k,36:L,37:A,38:O,39:M,40:_,41:D,42:P,46:H},{17:92,19:s,20:U,22:j,23:23,28:f,29:l,33:c,43:22,44:90,45:24,48:h,49:p,50:d,51:v,52:m,53:g,54:91,57:y},t(I,[2,5]),t(z,[2,26],{30:x,31:T,32:N,42:P}),t(z,[2,27],{30:x,31:T,32:N,42:P}),t(R,[2,28],{42:P}),t(R,[2,29],{42:P}),t(R,[2,30],{42:P}),t([15,20,34,35,46,47,55],[2,34],{28:E,29:S,30:x,31:T,32:N,36:L,37:A,38:O,39:M,40:_,41:D,42:P}),t([15,20,35,46,47,55],[2,35],{28:E,29:S,30:x,31:T,32:N,34:C,36:L,37:A,38:O,39:M,40:_,41:D,42:P}),t(W,[2,36],{28:E,29:S,30:x,31:T,32:N,38:O,39:M,40:_,41:D,42:P}),t(W,[2,37],{28:E,29:S,30:x,31:T,32:N,38:O,39:M,40:_,41:D,42:P}),t(X,[2,38],{28:E,29:S,30:x,31:T,32:N,42:P}),t(X,[2,39],{28:E,29:S,30:x,31:T,32:N,42:P}),t(X,[2,40],{28:E,29:S,30:x,31:T,32:N,42:P}),t(X,[2,41],{28:E,29:S,30:x,31:T,32:N,42:P}),t(F,[2,42],{19:[1,93]}),{28:E,29:S,30:x,31:T,32:N,34:C,35:k,36:L,37:A,38:O,39:M,40:_,41:D,42:P,46:H,47:[1,94]},{20:[1,95],28:E,29:S,30:x,31:T,32:N,34:C,35:k,36:L,37:A,38:O,39:M,40:_,41:D,42:P,46:H},{20:q,23:87,24:96,56:86,57:y},{20:[1,97]},{20:[2,63]},{20:[2,66],55:[1,98]},{17:99,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},t(F,[2,43],{19:[1,100]}),{20:[1,101]},{20:[2,59]},{20:[2,62],28:E,29:S,30:x,31:T,32:N,34:C,35:k,36:L,37:A,38:O,39:M,40:_,41:D,42:P,46:H,55:[1,102]},{17:92,19:s,20:U,22:j,23:23,28:f,29:l,33:c,43:22,44:103,45:24,48:h,49:p,50:d,51:v,52:m,53:g,54:91,57:y},{17:104,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},{6:105,7:106,8:n},{20:[1,107]},{6:108,7:109,8:n},{23:87,56:110,57:y},{15:[2,25],28:E,29:S,30:x,31:T,32:N,34:C,35:k,36:L,37:A,38:O,39:M,40:_,41:D,42:P,46:H},{17:92,19:s,20:U,22:j,23:23,28:f,29:l,33:c,43:22,44:111,45:24,48:h,49:p,50:d,51:v,52:m,53:g,54:91,57:y},t(F,[2,47]),{17:92,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,54:112,57:y},{20:[1,113]},t([15,20,47,55],[2,50],{28:E,29:S,30:x,31:T,32:N,34:C,35:k,36:L,37:A,38:O,39:M,40:_,41:D,42:P,46:H}),{21:[1,114]},{21:[1,115]},{6:116,7:117,8:n},t(F,[2,57]),t(F,[2,58]),{20:[2,65]},{20:[1,118]},{20:[2,61]},t(F,[2,48]),{6:119,7:120,8:n,12:121,18:i},{6:122,7:123,8:n,12:124,18:i},t(w,[2,22]),t(w,[2,23]),t(F,[2,46]),t(w,[2,16]),t(w,[2,17]),t(w,[2,20]),t(w,[2,18]),t(w,[2,19]),t(w,[2,21])],defaultActions:{5:[2,7],32:[2,1],33:[2,2],34:[2,3],86:[2,63],91:[2,59],110:[2,65],112:[2,61]},parseError:function(t,n){if(!n.recoverable){function r(e,t){this.message=e,this.hash=t}throw r.prototype=new Error,new r(t,n)}this.trace(t)},parse:function(t){function w(e){r.length=r.length-2*e,s.length=s.length-e,o.length=o.length-e}var n=this,r=[0],i=[],s=[null],o=[],u=this.table,a="",f=0,l=0,c=0,h=2,p=1,d=o.slice.call(arguments,1),v=Object.create(this.lexer),m={yy:{}};for(var g in this.yy)Object.prototype.hasOwnProperty.call(this.yy,g)&&(m.yy[g]=this.yy[g]);v.setInput(t,m.yy),m.yy.lexer=v,m.yy.parser=this,typeof v.yylloc=="undefined"&&(v.yylloc={});var y=v.yylloc;o.push(y);var b=v.options&&v.options.ranges;typeof m.yy.parseError=="function"?this.parseError=m.yy.parseError:this.parseError=Object.getPrototypeOf(this).parseError;function E(){var e;return e=v.lex()||p,typeof e!="number"&&(e=n.symbols_[e]||e),e}var S,x,T,N,C,k,L={},A,O,M,_;for(;;){T=r[r.length-1];if(this.defaultActions[T])N=this.defaultActions[T];else{if(S===null||typeof S=="undefined")S=E();N=u[T]&&u[T][S]}if(typeof N=="undefined"||!N.length||!N[0]){var D="";_=[];for(A in u[T])this.terminals_[A]&&A>h&&_.push("'"+this.terminals_[A]+"'");v.showPosition?D="Parse error on line "+(f+1)+":\n"+v.showPosition()+"\nExpecting "+_.join(", ")+", got '"+(this.terminals_[S]||S)+"'":D="Parse error on line "+(f+1)+": Unexpected "+(S==p?"end of input":"'"+(this.terminals_[S]||S)+"'"),this.parseError(D,{text:v.match,token:this.terminals_[S]||S,line:v.yylineno,loc:y,expected:_})}if(N[0]instanceof Array&&N.length>1)throw new Error("Parse Error: multiple actions possible at state: "+T+", token: "+S);switch(N[0]){case 1:r.push(S),s.push(v.yytext),o.push(v.yylloc),r.push(N[1]),S=null,x?(S=x,x=null):(l=v.yyleng,a=v.yytext,f=v.yylineno,y=v.yylloc,c>0&&c--);break;case 2:O=this.productions_[N[1]][1],L.$=s[s.length-O],L._$={first_line:o[o.length-(O||1)].first_line,last_line:o[o.length-1].last_line,first_column:o[o.length-(O||1)].first_column,last_column:o[o.length-1].last_column},b&&(L._$.range=[o[o.length-(O||1)].range[0],o[o.length-1].range[1]]),k=this.performAction.apply(L,[a,l,f,m.yy,N[1],s,o].concat(d));if(typeof k!="undefined")return k;O&&(r=r.slice(0,-1*O*2),s=s.slice(0,-1*O),o=o.slice(0,-1*O)),r.push(this.productions_[N[1]][0]),s.push(L.$),o.push(L._$),M=u[r[r.length-2]][r[r.length-1]],r.push(M);break;case 3:return!0}}return!0}},$=e("lib/parser/nodes"),J=function(){var e={EOF:1,parseError:function(t,n){if(!this.yy.parser)throw new Error(t);this.yy.parser.parseError(t,n)},setInput:function(e,t){return this.yy=t||this.yy||{},this._input=e,this._more=this._backtrack=this.done=!1,this.yylineno=this.yyleng=0,this.yytext=this.matched=this.match="",this.conditionStack=["INITIAL"],this.yylloc={first_line:1,first_column:0,last_line:1,last_column:0},this.options.ranges&&(this.yylloc.range=[0,0]),this.offset=0,this},input:function(){var e=this._input[0];this.yytext+=e,this.yyleng++,this.offset++,this.match+=e,this.matched+=e;var t=e.match(/(?:\r\n?|\n).*/g);return t?(this.yylineno++,this.yylloc.last_line++):this.yylloc.last_column++,this.options.ranges&&this.yylloc.range[1]++,this._input=this._input.slice(1),e},unput:function(e){var t=e.length,n=e.split(/(?:\r\n?|\n)/g);this._input=e+this._input,this.yytext=this.yytext.substr(0,this.yytext.length-t),this.offset-=t;var r=this.match.split(/(?:\r\n?|\n)/g);this.match=this.match.substr(0,this.match.length-1),this.matched=this.matched.substr(0,this.matched.length-1),n.length-1&&(this.yylineno-=n.length-1);var i=this.yylloc.range;return this.yylloc={first_line:this.yylloc.first_line,last_line:this.yylineno+1,first_column:this.yylloc.first_column,last_column:n?(n.length===r.length?this.yylloc.first_column:0)+r[r.length-n.length].length-n[0].length:this.yylloc.first_column-t},this.options.ranges&&(this.yylloc.range=[i[0],i[0]+this.yyleng-t]),this.yyleng=this.yytext.length,this},more:function(){return this._more=!0,this},reject:function(){return this.options.backtrack_lexer?(this._backtrack=!0,this):this.parseError("Lexical error on line "+(this.yylineno+1)+". You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).\n"+this.showPosition(),{text:"",token:null,line:this.yylineno})},less:function(e){this.unput(this.match.slice(e))},pastInput:function(){var e=this.matched.substr(0,this.matched.length-this.match.length);return(e.length>20?"...":"")+e.substr(-20).replace(/\n/g,"")},upcomingInput:function(){var e=this.match;return e.length<20&&(e+=this._input.substr(0,20-e.length)),(e.substr(0,20)+(e.length>20?"...":"")).replace(/\n/g,"")},showPosition:function(){var e=this.pastInput(),t=(new Array(e.length+1)).join("-");return e+this.upcomingInput()+"\n"+t+"^"},test_match:function(e,t){var n,r,i;this.options.backtrack_lexer&&(i={yylineno:this.yylineno,yylloc:{first_line:this.yylloc.first_line,last_line:this.last_line,first_column:this.yylloc.first_column,last_column:this.yylloc.last_column},yytext:this.yytext,match:this.match,matches:this.matches,matched:this.matched,yyleng:this.yyleng,offset:this.offset,_more:this._more,_input:this._input,yy:this.yy,conditionStack:this.conditionStack.slice(0),done:this.done},this.options.ranges&&(i.yylloc.range=this.yylloc.range.slice(0))),r=e[0].match(/(?:\r\n?|\n).*/g),r&&(this.yylineno+=r.length),this.yylloc={first_line:this.yylloc.last_line,last_line:this.yylineno+1,first_column:this.yylloc.last_column,last_column:r?r[r.length-1].length-r[r.length-1].match(/\r?\n?/)[0].length:this.yylloc.last_column+e[0].length},this.yytext+=e[0],this.match+=e[0],this.matches=e,this.yyleng=this.yytext.length,this.options.ranges&&(this.yylloc.range=[this.offset,this.offset+=this.yyleng]),this._more=!1,this._backtrack=!1,this._input=this._input.slice(e[0].length),this.matched+=e[0],n=this.performAction.call(this,this.yy,this,t,this.conditionStack[this.conditionStack.length-1]),this.done&&this._input&&(this.done=!1);if(n)return n;if(this._backtrack){for(var s in i)this[s]=i[s];return!1}return!1},next:function(){if(this.done)return this.EOF;this._input||(this.done=!0);var e,t,n,r;this._more||(this.yytext="",this.match="");var i=this._currentRules();for(var s=0;s<i.length;s++){n=this._input.match(this.rules[i[s]]);if(n&&(!t||n[0].length>t[0].length)){t=n,r=s;if(this.options.backtrack_lexer){e=this.test_match(n,i[s]);if(e!==!1)return e;if(this._backtrack){t=!1;continue}return!1}if(!this.options.flex)break}}return t?(e=this.test_match(t,i[r]),e!==!1?e:!1):this._input===""?this.EOF:this.parseError("Lexical error on line "+(this.yylineno+1)+". Unrecognized text.\n"+this.showPosition(),{text:"",token:null,line:this.yylineno})},lex:function(){var t=this.next();return t?t:this.lex()},begin:function(t){this.conditionStack.push(t)},popState:function(){var t=this.conditionStack.length-1;return t>0?this.conditionStack.pop():this.conditionStack[0]},_currentRules:function(){return this.conditionStack.length&&this.conditionStack[this.conditionStack.length-1]?this.conditions[this.conditionStack[this.conditionStack.length-1]].rules:this.conditions.INITIAL.rules},topState:function(t){return t=this.conditionStack.length-1-Math.abs(t||0),t>=0?this.conditionStack[t]:"INITIAL"},pushState:function(t){this.begin(t)},stateStackSize:function(){return this.conditionStack.length},options:{},performAction:function(t,n,r,i){var s=i;switch(r){case 0:break;case 1:break;case 2:break;case 3:return 22;case 4:return"INVALID";case 5:return 25;case 6:return 18;case 7:return 21;case 8:return"while";case 9:return"for";case 10:return"case";case 11:return"default";case 12:return"new";case 13:return"break";case 14:return"continue";case 15:return 26;case 16:return 36;case 17:return 27;case 18:return 8;case 19:return 9;case 20:return 15;case 21:return 55;case 22:return 51;case 23:return 52;case 24:return 53;case 25:return"[";case 26:return"]";case 27:return 42;case 28:this.begin("DoubleQuotedString"),this.string="";break;case 29:this.begin("SingleQuotedString"),this.string="";break;case 30:this.begin("QuotedStringEscape");break;case 31:return n.yytext=this.string,this.string=undefined,this.popState(),48;case 32:return n.yytext=this.string,this.string=undefined,this.popState(),48;case 33:switch(n.yytext){case"\r\n":case"\n":break;case"b":this.string+="\b";break;case"n":this.string+="\n";break;case"r":this.string+="\r";break;case"t":this.string+="	";break;case"'":this.string+="'";break;case'"':this.string+='"';break;case"\\":this.string+="\\";break;default:this.string+="\\"+$1}this.popState();break;case 34:this.string+=n.yytext;break;case 35:this.string+=n.yytext;break;case 36:return 57;case 37:return 49;case 38:return 50;case 39:return 28;case 40:return 29;case 41:return 30;case 42:return 31;case 43:return 32;case 44:return 37;case 45:return 41;case 46:return 40;case 47:return 39;case 48:return 38;case 49:return 33;case 50:return 34;case 51:return 35;case 52:return 19;case 53:return 20;case 54:return 46;case 55:return 47;case 56:return 5;case 57:return"INVALID"}},rules:[/^(?:\/\/([^\n\r]*))/,/^(?:\/\*([\u0000-\uffff]*?)\*\/)/,/^(?:\s+)/,/^(?:function\b)/,/^(?:return\s*\n)/,/^(?:return\b)/,/^(?:if\b)/,/^(?:else\b)/,/^(?:while\b)/,/^(?:for\b)/,/^(?:case\b)/,/^(?:default\b)/,/^(?:new\b)/,/^(?:break\b)/,/^(?:continue\b)/,/^(?:var\b)/,/^(?:===)/,/^(?:=)/,/^(?:\{)/,/^(?:\})/,/^(?:;)/,/^(?:,)/,/^(?:true\b)/,/^(?:false\b)/,/^(?:\[\])/,/^(?:\[)/,/^(?:\])/,/^(?:\.)/,/^(?:")/,/^(?:')/,/^(?:\\)/,/^(?:")/,/^(?:')/,/^(?:(.|\r\n|\n))/,/^(?:[^"\\]*)/,/^(?:[^'\\]*)/,/^(?:[A-Za-z_][A-Za-z0-9_]*)/,/^(?:[0-9]+(\.[0-9]+)?([eE][\-+]?[0-9]+)?\b)/,/^(?:[0-9]+\b)/,/^(?:\+)/,/^(?:-)/,/^(?:\*)/,/^(?:\/)/,/^(?:%)/,/^(?:!==)/,/^(?:<=)/,/^(?:>=)/,/^(?:<)/,/^(?:>)/,/^(?:!)/,/^(?:&&)/,/^(?:\|\|)/,/^(?:\()/,/^(?:\))/,/^(?:\?)/,/^(?::)/,/^(?:$)/,/^(?:.)/],conditions:{QuotedStringEscape:{rules:[33],inclusive:!1},SingleQuotedString:{rules:[30,32,35],inclusive:!1},DoubleQuotedString:{rules:[30,31,34],inclusive:!1},INITIAL:{rules:[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57],inclusive:!0}}};return e}();return V.lexer=J,V.lexer.options.ranges=!0,V}),n("lib/parser/parser-week-6.js",["require","lib/parser/nodes"],function(e){var t=function(e,t,n,r){for(n=n||{},r=e.length;r--;n[e[r]]=t);return n},n=[1,6],r=[1,13],i=[1,14],s=[1,21],o=[1,15],u=[1,16],a=[1,17],f=[1,19],l=[1,18],c=[1,20],h=[1,25],p=[1,26],d=[1,27],v=[1,28],m=[1,29],g=[1,30],y=[1,31],b=[5,9],w=[5,9,15,18,19,22,25,26,28,29,33,48,49,50,51,52,53,57],E=[1,41],S=[1,42],x=[1,43],T=[1,44],N=[1,45],C=[1,46],k=[1,47],L=[1,48],A=[1,49],O=[1,50],M=[1,51],_=[1,52],D=[1,53],P=[1,54],H=[1,55],B=[1,58],j=[1,60],F=[15,20,28,29,30,31,32,34,35,36,37,38,39,40,41,42,46,47,55],I=[5,9,15,18,19,20,21,22,25,26,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,46,47,48,49,50,51,52,53,55,57],q=[2,64],R=[15,20,28,29,30,31,32,34,35,36,37,38,39,40,41,46,47,55],U=[2,60],z=[15,20,28,29,34,35,36,37,38,39,40,41,46,47,55],W=[15,20,34,35,36,37,46,47,55],X=[15,20,34,35,36,37,38,39,40,41,46,47,55],V={trace:function(){},yy:{},symbols_:{error:2,program:3,statements:4,EOF:5,statement_block:6,empty_block:7,"{":8,"}":9,non_empty_statements:10,statement:11,if_statement:12,function_definition:13,return_statement:14,";":15,variable_definition:16,expression:17,"if":18,"(":19,")":20,"else":21,"function":22,identifier:23,identifiers:24,"return":25,"var":26,"=":27,"+":28,"-":29,"*":30,"/":31,"%":32,"!":33,"&&":34,"||":35,"===":36,"!==":37,">":38,"<":39,">=":40,"<=":41,".":42,constants:43,expressions:44,function_expression:45,"?":46,":":47,STRING:48,FLOAT_NUMBER:49,INT_NUMBER:50,"true":51,"false":52,empty_list:53,non_empty_expressions:54,",":55,non_empty_identifiers:56,Identifier:57,$accept:0,$end:1},terminals_:{2:"error",5:"EOF",8:"{",9:"}",15:";",18:"if",19:"(",20:")",21:"else",22:"function",25:"return",26:"var",27:"=",28:"+",29:"-",30:"*",31:"/",32:"%",33:"!",34:"&&",35:"||",36:"===",37:"!==",38:">",39:"<",40:">=",41:"<=",42:".",46:"?",47:":",48:"STRING",49:"FLOAT_NUMBER",50:"INT_NUMBER",51:"true",52:"false",53:"empty_list",55:",",57:"Identifier"},productions_:[0,[3,2],[3,2],[3,2],[7,2],[6,3],[4,0],[4,1],[10,2],[10,1],[11,1],[11,1],[11,2],[11,2],[11,2],[11,1],[12,7],[12,7],[12,7],[12,7],[12,7],[12,7],[13,6],[13,6],[14,2],[16,4],[17,3],[17,3],[17,3],[17,3],[17,3],[17,2],[17,2],[17,2],[17,3],[17,3],[17,3],[17,3],[17,3],[17,3],[17,3],[17,3],[17,3],[17,3],[17,1],[17,1],[17,6],[17,4],[17,6],[17,1],[17,5],[43,1],[43,1],[43,1],[43,1],[43,1],[43,1],[45,5],[45,5],[44,1],[44,0],[54,3],[54,1],[24,1],[24,0],[56,3],[56,1],[23,1]],performAction:function(t,n,r,i,s,o,u){var a=o.length-1;switch(s){case 1:case 2:case 3:return o[a-1];case 4:this.$=[];break;case 5:case 43:this.$=o[a-1];break;case 6:case 60:case 64:this.$=[];break;case 8:o[a-1]===$.no_op()?this.$=o[a]:this.$=$.pair(o[a-1],o[a]);break;case 9:o[a]===$.no_op()?this.$=[]:this.$=$.pair(o[a],[]);break;case 15:this.$=$.no_op();break;case 16:case 17:case 18:case 19:this.$=$.if_statement(o[a-4],o[a-2],o[a],r);break;case 20:case 21:this.$=$.if_statement(o[a-4],o[a-2],$.pair(o[a],[]),r);break;case 22:case 23:this.$=$.variable_definition(o[a-4],$.function_definition(o[a-4],o[a-2],o[a],u[a-5],u[a]),r);break;case 24:this.$=$.return_statement(o[a],r);break;case 25:this.$=$.variable_definition(o[a-2],o[a],r);break;case 26:case 27:case 28:case 29:case 30:case 36:case 37:case 38:case 39:case 40:case 41:this.$=$.eager_binary_expression(o[a-2],o[a-1],o[a],r);break;case 31:case 32:this.$=$.eager_binary_expression(0,o[a-1],o[a],r);break;case 33:this.$=$.eager_unary_expression(o[a-1],o[a],r);break;case 34:case 35:this.$=$.boolean_operation(o[a-2],o[a-1],o[a],r);break;case 42:this.$=$.property_access(o[a-2],o[a],r);break;case 45:this.$=$.variable(o[a],r);break;case 46:this.$=$.application(o[a-4],o[a-1],r);break;case 47:this.$=$.application($.variable(o[a-3],r),o[a-1],r);break;case 48:this.$=$.object_method_application(o[a-5],o[a-3],o[a-1],r);break;case 50:this.$=$.ternary(o[a-4],o[a-2],o[a],r);break;case 51:case 67:this.$=t;break;case 52:this.$=parseFloat(t);break;case 53:this.$=parseInt(t,10);break;case 54:this.$=!0;break;case 55:this.$=!1;break;case 56:this.$=$.empty_list(r);break;case 57:case 58:this.$=$.function_definition("lambda",o[a-2],o[a],u[a-4],u[a]);break;case 59:case 63:this.$=o[a];break;case 61:case 65:this.$=$.pair(o[a-2],o[a]);break;case 62:case 66:this.$=$.pair(o[a],[])}},table:[{3:1,4:2,5:[2,6],6:3,7:4,8:n,10:5,11:7,12:8,13:9,14:10,15:r,16:11,17:12,18:i,19:s,22:o,23:23,25:u,26:a,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},{1:[3]},{5:[1,32]},{5:[1,33]},{5:[1,34]},{5:[2,7]},{9:[1,36],10:35,11:7,12:8,13:9,14:10,15:r,16:11,17:12,18:i,19:s,22:o,23:23,25:u,26:a,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},t(b,[2,9],{11:7,12:8,13:9,14:10,16:11,17:12,43:22,23:23,45:24,10:37,15:r,18:i,19:s,22:o,25:u,26:a,28:f,29:l,33:c,48:h,49:p,50:d,51:v,52:m,53:g,57:y}),t(w,[2,10]),t(w,[2,11]),{15:[1,38]},{15:[1,39]},{15:[1,40],28:E,29:S,30:x,31:T,32:N,34:C,35:k,36:L,37:A,38:O,39:M,40:_,41:D,42:P,46:H},t(w,[2,15]),{19:[1,56]},{19:B,23:57,57:y},{17:59,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},{23:61,57:y},{17:62,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},{17:63,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},{17:64,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},{17:65,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},t(F,[2,44]),t(F,[2,45],{19:[1,66]}),t(F,[2,49]),t(F,[2,51]),t(F,[2,52]),t(F,[2,53]),t(F,[2,54]),t(F,[2,55]),t(F,[2,56]),t([15,19,20,27,28,29,30,31,32,34,35,36,37,38,39,40,41,42,46,47,55],[2,67]),{1:[2,1]},{1:[2,2]},{1:[2,3]},{9:[1,67]},t(I,[2,4]),t(b,[2,8]),t(w,[2,12]),t(w,[2,13]),t(w,[2,14]),{17:68,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},{17:69,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},{17:70,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},{17:71,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},{17:72,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},{17:73,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},{17:74,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},{17:75,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},{17:76,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},{17:77,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},{17:78,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},{17:79,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},{17:80,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},{23:81,57:y},{17:82,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},{17:83,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},{19:[1,84]},{20:q,23:87,24:85,56:86,57:y},{15:[2,24],28:E,29:S,30:x,31:T,32:N,34:C,35:k,36:L,37:A,38:O,39:M,40:_,41:D,42:P,46:H},{19:B},{27:[1,88]},t(R,[2,31],{42:P}),t(R,[2,32],{42:P}),t(R,[2,33],{42:P}),{20:[1,89],28:E,29:S,30:x,31:T,32:N,34:C,35:k,36:L,37:A,38:O,39:M,40:_,41:D,42:P,46:H},{17:92,19:s,20:U,22:j,23:23,28:f,29:l,33:c,43:22,44:90,45:24,48:h,49:p,50:d,51:v,52:m,53:g,54:91,57:y},t(I,[2,5]),t(z,[2,26],{30:x,31:T,32:N,42:P}),t(z,[2,27],{30:x,31:T,32:N,42:P}),t(R,[2,28],{42:P}),t(R,[2,29],{42:P}),t(R,[2,30],{42:P}),t([15,20,34,35,46,47,55],[2,34],{28:E,29:S,30:x,31:T,32:N,36:L,37:A,38:O,39:M,40:_,41:D,42:P}),t([15,20,35,46,47,55],[2,35],{28:E,29:S,30:x,31:T,32:N,34:C,36:L,37:A,38:O,39:M,40:_,41:D,42:P}),t(W,[2,36],{28:E,29:S,30:x,31:T,32:N,38:O,39:M,40:_,41:D,42:P}),t(W,[2,37],{28:E,29:S,30:x,31:T,32:N,38:O,39:M,40:_,41:D,42:P}),t(X,[2,38],{28:E,29:S,30:x,31:T,32:N,42:P}),t(X,[2,39],{28:E,29:S,30:x,31:T,32:N,42:P}),t(X,[2,40],{28:E,29:S,30:x,31:T,32:N,42:P}),t(X,[2,41],{28:E,29:S,30:x,31:T,32:N,42:P}),t(F,[2,42],{19:[1,93]}),{28:E,29:S,30:x,31:T,32:N,34:C,35:k,36:L,37:A,38:O,39:M,40:_,41:D,42:P,46:H,47:[1,94]},{20:[1,95],28:E,29:S,30:x,31:T,32:N,34:C,35:k,36:L,37:A,38:O,39:M,40:_,41:D,42:P,46:H},{20:q,23:87,24:96,56:86,57:y},{20:[1,97]},{20:[2,63]},{20:[2,66],55:[1,98]},{17:99,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},t(F,[2,43],{19:[1,100]}),{20:[1,101]},{20:[2,59]},{20:[2,62],28:E,29:S,30:x,31:T,32:N,34:C,35:k,36:L,37:A,38:O,39:M,40:_,41:D,42:P,46:H,55:[1,102]},{17:92,19:s,20:U,22:j,23:23,28:f,29:l,33:c,43:22,44:103,45:24,48:h,49:p,50:d,51:v,52:m,53:g,54:91,57:y},{17:104,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,57:y},{6:105,7:106,8:n},{20:[1,107]},{6:108,7:109,8:n},{23:87,56:110,57:y},{15:[2,25],28:E,29:S,30:x,31:T,32:N,34:C,35:k,36:L,37:A,38:O,39:M,40:_,41:D,42:P,46:H},{17:92,19:s,20:U,22:j,23:23,28:f,29:l,33:c,43:22,44:111,45:24,48:h,49:p,50:d,51:v,52:m,53:g,54:91,57:y},t(F,[2,47]),{17:92,19:s,22:j,23:23,28:f,29:l,33:c,43:22,45:24,48:h,49:p,50:d,51:v,52:m,53:g,54:112,57:y},{20:[1,113]},t([15,20,47,55],[2,50],{28:E,29:S,30:x,31:T,32:N,34:C,35:k,36:L,37:A,38:O,39:M,40:_,41:D,42:P,46:H}),{21:[1,114]},{21:[1,115]},{6:116,7:117,8:n},t(F,[2,57]),t(F,[2,58]),{20:[2,65]},{20:[1,118]},{20:[2,61]},t(F,[2,48]),{6:119,7:120,8:n,12:121,18:i},{6:122,7:123,8:n,12:124,18:i},t(w,[2,22]),t(w,[2,23]),t(F,[2,46]),t(w,[2,16]),t(w,[2,17]),t(w,[2,20]),t(w,[2,18]),t(w,[2,19]),t(w,[2,21])],defaultActions:{5:[2,7],32:[2,1],33:[2,2],34:[2,3],86:[2,63],91:[2,59],110:[2,65],112:[2,61]},parseError:function(t,n){if(!n.recoverable){function r(e,t){this.message=e,this.hash=t}throw r.prototype=new Error,new r(t,n)}this.trace(t)},parse:function(t){function w(e){r.length=r.length-2*e,s.length=s.length-e,o.length=o.length-e}var n=this,r=[0],i=[],s=[null],o=[],u=this.table,a="",f=0,l=0,c=0,h=2,p=1,d=o.slice.call(arguments,1),v=Object.create(this.lexer),m={yy:{}};for(var g in this.yy)Object.prototype.hasOwnProperty.call(this.yy,g)&&(m.yy[g]=this.yy[g]);v.setInput(t,m.yy),m.yy.lexer=v,m.yy.parser=this,typeof v.yylloc=="undefined"&&(v.yylloc={});var y=v.yylloc;o.push(y);var b=v.options&&v.options.ranges;typeof m.yy.parseError=="function"?this.parseError=m.yy.parseError:this.parseError=Object.getPrototypeOf(this).parseError;function E(){var e;return e=v.lex()||p,typeof e!="number"&&(e=n.symbols_[e]||e),e}var S,x,T,N,C,k,L={},A,O,M,_;for(;;){T=r[r.length-1];if(this.defaultActions[T])N=this.defaultActions[T];else{if(S===null||typeof S=="undefined")S=E();N=u[T]&&u[T][S]}if(typeof N=="undefined"||!N.length||!N[0]){var D="";_=[];for(A in u[T])this.terminals_[A]&&A>h&&_.push("'"+this.terminals_[A]+"'");v.showPosition?D="Parse error on line "+(f+1)+":\n"+v.showPosition()+"\nExpecting "+_.join(", ")+", got '"+(this.terminals_[S]||S)+"'":D="Parse error on line "+(f+1)+": Unexpected "+(S==p?"end of input":"'"+(this.terminals_[S]||S)+"'"),this.parseError(D,{text:v.match,token:this.terminals_[S]||S,line:v.yylineno,loc:y,expected:_})}if(N[0]instanceof Array&&N.length>1)throw new Error("Parse Error: multiple actions possible at state: "+T+", token: "+S);switch(N[0]){case 1:r.push(S),s.push(v.yytext),o.push(v.yylloc),r.push(N[1]),S=null,x?(S=x,x=null):(l=v.yyleng,a=v.yytext,f=v.yylineno,y=v.yylloc,c>0&&c--);break;case 2:O=this.productions_[N[1]][1],L.$=s[s.length-O],L._$={first_line:o[o.length-(O||1)].first_line,last_line:o[o.length-1].last_line,first_column:o[o.length-(O||1)].first_column,last_column:o[o.length-1].last_column},b&&(L._$.range=[o[o.length-(O||1)].range[0],o[o.length-1].range[1]]),k=this.performAction.apply(L,[a,l,f,m.yy,N[1],s,o].concat(d));if(typeof k!="undefined")return k;O&&(r=r.slice(0,-1*O*2),s=s.slice(0,-1*O),o=o.slice(0,-1*O)),r.push(this.productions_[N[1]][0]),s.push(L.$),o.push(L._$),M=u[r[r.length-2]][r[r.length-1]],r.push(M);break;case 3:return!0}}return!0}},$=e("lib/parser/nodes"),J=function(){var e={EOF:1,parseError:function(t,n){if(!this.yy.parser)throw new Error(t);this.yy.parser.parseError(t,n)},setInput:function(e,t){return this.yy=t||this.yy||{},this._input=e,this._more=this._backtrack=this.done=!1,this.yylineno=this.yyleng=0,this.yytext=this.matched=this.match="",this.conditionStack=["INITIAL"],this.yylloc={first_line:1,first_column:0,last_line:1,last_column:0},this.options.ranges&&(this.yylloc.range=[0,0]),this.offset=0,this},input:function(){var e=this._input[0];this.yytext+=e,this.yyleng++,this.offset++,this.match+=e,this.matched+=e;var t=e.match(/(?:\r\n?|\n).*/g);return t?(this.yylineno++,this.yylloc.last_line++):this.yylloc.last_column++,this.options.ranges&&this.yylloc.range[1]++,this._input=this._input.slice(1),e},unput:function(e){var t=e.length,n=e.split(/(?:\r\n?|\n)/g);this._input=e+this._input,this.yytext=this.yytext.substr(0,this.yytext.length-t),this.offset-=t;var r=this.match.split(/(?:\r\n?|\n)/g);this.match=this.match.substr(0,this.match.length-1),this.matched=this.matched.substr(0,this.matched.length-1),n.length-1&&(this.yylineno-=n.length-1);var i=this.yylloc.range;return this.yylloc={first_line:this.yylloc.first_line,last_line:this.yylineno+1,first_column:this.yylloc.first_column,last_column:n?(n.length===r.length?this.yylloc.first_column:0)+r[r.length-n.length].length-n[0].length:this.yylloc.first_column-t},this.options.ranges&&(this.yylloc.range=[i[0],i[0]+this.yyleng-t]),this.yyleng=this.yytext.length,this},more:function(){return this._more=!0,this},reject:function(){return this.options.backtrack_lexer?(this._backtrack=!0,this):this.parseError("Lexical error on line "+(this.yylineno+1)+". You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).\n"+this.showPosition(),{text:"",token:null,line:this.yylineno})},less:function(e){this.unput(this.match.slice(e))},pastInput:function(){var e=this.matched.substr(0,this.matched.length-this.match.length);return(e.length>20?"...":"")+e.substr(-20).replace(/\n/g,"")},upcomingInput:function(){var e=this.match;return e.length<20&&(e+=this._input.substr(0,20-e.length)),(e.substr(0,20)+(e.length>20?"...":"")).replace(/\n/g,"")},showPosition:function(){var e=this.pastInput(),t=(new Array(e.length+1)).join("-");return e+this.upcomingInput()+"\n"+t+"^"},test_match:function(e,t){var n,r,i;this.options.backtrack_lexer&&(i={yylineno:this.yylineno,yylloc:{first_line:this.yylloc.first_line,last_line:this.last_line,first_column:this.yylloc.first_column,last_column:this.yylloc.last_column},yytext:this.yytext,match:this.match,matches:this.matches,matched:this.matched,yyleng:this.yyleng,offset:this.offset,_more:this._more,_input:this._input,yy:this.yy,conditionStack:this.conditionStack.slice(0),done:this.done},this.options.ranges&&(i.yylloc.range=this.yylloc.range.slice(0))),r=e[0].match(/(?:\r\n?|\n).*/g),r&&(this.yylineno+=r.length),this.yylloc={first_line:this.yylloc.last_line,last_line:this.yylineno+1,first_column:this.yylloc.last_column,last_column:r?r[r.length-1].length-r[r.length-1].match(/\r?\n?/)[0].length:this.yylloc.last_column+e[0].length},this.yytext+=e[0],this.match+=e[0],this.matches=e,this.yyleng=this.yytext.length,this.options.ranges&&(this.yylloc.range=[this.offset,this.offset+=this.yyleng]),this._more=!1,this._backtrack=!1,this._input=this._input.slice(e[0].length),this.matched+=e[0],n=this.performAction.call(this,this.yy,this,t,this.conditionStack[this.conditionStack.length-1]),this.done&&this._input&&(this.done=!1);if(n)return n;if(this._backtrack){for(var s in i)this[s]=i[s];return!1}return!1},next:function(){if(this.done)return this.EOF;this._input||(this.done=!0);var e,t,n,r;this._more||(this.yytext="",this.match="");var i=this._currentRules();for(var s=0;s<i.length;s++){n=this._input.match(this.rules[i[s]]);if(n&&(!t||n[0].length>t[0].length)){t=n,r=s;if(this.options.backtrack_lexer){e=this.test_match(n,i[s]);if(e!==!1)return e;if(this._backtrack){t=!1;continue}return!1}if(!this.options.flex)break}}return t?(e=this.test_match(t,i[r]),e!==!1?e:!1):this._input===""?this.EOF:this.parseError("Lexical error on line "+(this.yylineno+1)+". Unrecognized text.\n"+this.showPosition(),{text:"",token:null,line:this.yylineno})},lex:function(){var t=this.next();return t?t:this.lex()},begin:function(t){this.conditionStack.push(t)},popState:function(){var t=this.conditionStack.length-1;return t>0?this.conditionStack.pop():this.conditionStack[0]},_currentRules:function(){return this.conditionStack.length&&this.conditionStack[this.conditionStack.length-1]?this.conditions[this.conditionStack[this.conditionStack.length-1]].rules:this.conditions.INITIAL.rules},topState:function(t){return t=this.conditionStack.length-1-Math.abs(t||0),t>=0?this.conditionStack[t]:"INITIAL"},pushState:function(t){this.begin(t)},stateStackSize:function(){return this.conditionStack.length},options:{},performAction:function(t,n,r,i){var s=i;switch(r){case 0:break;case 1:break;case 2:break;case 3:return 22;case 4:return"INVALID";case 5:return 25;case 6:return 18;case 7:return 21;case 8:return"while";case 9:return"for";case 10:return"case";case 11:return"default";case 12:return"new";case 13:return"break";case 14:return"continue";case 15:return 26;case 16:return 36;case 17:return 27;case 18:return 8;case 19:return 9;case 20:return 15;case 21:return 55;case 22:return 51;case 23:return 52;case 24:return 53;case 25:return"[";case 26:return"]";case 27:return 42;case 28:this.begin("DoubleQuotedString"),this.string="";break;case 29:this.begin("SingleQuotedString"),this.string="";break;case 30:this.begin("QuotedStringEscape");break;case 31:return n.yytext=this.string,this.string=undefined,this.popState(),48;case 32:return n.yytext=this.string,this.string=undefined,this.popState(),48;case 33:switch(n.yytext){case"\r\n":case"\n":break;case"b":this.string+="\b";break;case"n":this.string+="\n";break;case"r":this.string+="\r";break;case"t":this.string+="	";break;case"'":this.string+="'";break;case'"':this.string+='"';break;case"\\":this.string+="\\";break;default:this.string+="\\"+$1}this.popState();break;case 34:this.string+=n.yytext;break;case 35:this.string+=n.yytext;break;case 36:return 57;case 37:return 49;case 38:return 50;case 39:return 28;case 40:return 29;case 41:return 30;case 42:return 31;case 43:return 32;case 44:return 37;case 45:return 41;case 46:return 40;case 47:return 39;case 48:return 38;case 49:return 33;case 50:return 34;case 51:return 35;case 52:return 19;case 53:return 20;case 54:return 46;case 55:return 47;case 56:return 5;case 57:return"INVALID"}},rules:[/^(?:\/\/([^\n\r]*))/,/^(?:\/\*([\u0000-\uffff]*?)\*\/)/,/^(?:\s+)/,/^(?:function\b)/,/^(?:return\s*\n)/,/^(?:return\b)/,/^(?:if\b)/,/^(?:else\b)/,/^(?:while\b)/,/^(?:for\b)/,/^(?:case\b)/,/^(?:default\b)/,/^(?:new\b)/,/^(?:break\b)/,/^(?:continue\b)/,/^(?:var\b)/,/^(?:===)/,/^(?:=)/,/^(?:\{)/,/^(?:\})/,/^(?:;)/,/^(?:,)/,/^(?:true\b)/,/^(?:false\b)/,/^(?:\[\])/,/^(?:\[)/,/^(?:\])/,/^(?:\.)/,/^(?:")/,/^(?:')/,/^(?:\\)/,/^(?:")/,/^(?:')/,/^(?:(.|\r\n|\n))/,/^(?:[^"\\]*)/,/^(?:[^'\\]*)/,/^(?:[A-Za-z_][A-Za-z0-9_]*)/,/^(?:[0-9]+(\.[0-9]+)?([eE][\-+]?[0-9]+)?\b)/,/^(?:[0-9]+\b)/,/^(?:\+)/,/^(?:-)/,/^(?:\*)/,/^(?:\/)/,/^(?:%)/,/^(?:!==)/,/^(?:<=)/,/^(?:>=)/,/^(?:<)/,/^(?:>)/,/^(?:!)/,/^(?:&&)/,/^(?:\|\|)/,/^(?:\()/,/^(?:\))/,/^(?:\?)/,/^(?::)/,/^(?:$)/,/^(?:.)/],conditions:{QuotedStringEscape:{rules:[33],inclusive:!1},SingleQuotedString:{rules:[30,32,35],inclusive:!1},DoubleQuotedString:{rules:[30,31,34],inclusive:!1},INITIAL:{rules:[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57],inclusive:!0}}};return e}();return V.lexer=J,V.lexer.options.ranges=!0,V}),n("lib/parser/parser-week-8.js",["require","lib/parser/nodes"],function(e){var t=function(e,t,n,r){for(n=n||{},r=e.length;r--;n[e[r]]=t);return n},n=[1,6],r=[1,15],i=[1,16],s=[1,24],o=[1,17],u=[1,18],a=[1,19],f=[1,20],l=[1,22],c=[1,21],h=[1,23],p=[1,28],d=[1,29],v=[1,30],m=[1,31],g=[1,32],y=[1,33],b=[1,34],w=[5,9],E=[5,9,16,20,21,24,25,28,29,31,32,36,51,52,53,54,55,56,60],S=[1,46],x=[1,47],T=[1,48],N=[1,49],C=[1,50],k=[1,51],L=[1,52],A=[1,53],O=[1,54],M=[1,55],_=[1,56],D=[1,57],P=[1,58],H=[1,59],B=[1,60],j=[1,64],F=[1,66],I=[16,22,30,31,32,33,34,35,37,38,39,40,41,42,43,44,45,49,50,58],q=[5,9,16,20,21,22,23,24,25,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,49,50,51,52,53,54,55,56,58,60],R=[2,69],U=[16,22,30,31,32,33,34,35,37,38,39,40,41,42,43,44,49,50,58],z=[2,65],W=[16,22,30,31,32,37,38,39,40,41,42,43,44,49,50,58],X=[16,22,30,37,38,39,40,49,50,58],V=[16,22,30,37,38,39,40,41,42,43,44,49,50,58],$={trace:function(){},yy:{},symbols_:{error:2,program:3,statements:4,EOF:5,statement_block:6,empty_block:7,"{":8,"}":9,non_empty_statements:10,statement:11,if_statement:12,while_statement:13,function_definition:14,return_statement:15,";":16,variable_definition:17,assignment_statement:18,expression:19,"if":20,"(":21,")":22,"else":23,"while":24,"function":25,identifier:26,identifiers:27,"return":28,"var":29,"=":30,"+":31,"-":32,"*":33,"/":34,"%":35,"!":36,"&&":37,"||":38,"===":39,"!==":40,">":41,"<":42,">=":43,"<=":44,".":45,constants:46,expressions:47,function_expression:48,"?":49,":":50,STRING:51,FLOAT_NUMBER:52,INT_NUMBER:53,"true":54,"false":55,empty_list:56,non_empty_expressions:57,",":58,non_empty_identifiers:59,Identifier:60,$accept:0,$end:1},terminals_:{2:"error",5:"EOF",8:"{",9:"}",16:";",20:"if",21:"(",22:")",23:"else",24:"while",25:"function",28:"return",29:"var",30:"=",31:"+",32:"-",33:"*",34:"/",35:"%",36:"!",37:"&&",38:"||",39:"===",40:"!==",41:">",42:"<",43:">=",44:"<=",45:".",49:"?",50:":",51:"STRING",52:"FLOAT_NUMBER",53:"INT_NUMBER",54:"true",55:"false",56:"empty_list",58:",",60:"Identifier"},productions_:[0,[3,2],[3,2],[3,2],[7,2],[6,3],[4,0],[4,1],[10,2],[10,1],[11,1],[11,1],[11,1],[11,2],[11,2],[11,2],[11,2],[11,1],[12,7],[12,7],[12,7],[12,7],[12,7],[12,7],[13,5],[13,5],[14,6],[14,6],[15,2],[17,4],[18,3],[19,3],[19,3],[19,3],[19,3],[19,3],[19,2],[19,2],[19,2],[19,3],[19,3],[19,3],[19,3],[19,3],[19,3],[19,3],[19,3],[19,3],[19,3],[19,1],[19,1],[19,6],[19,4],[19,6],[19,1],[19,5],[46,1],[46,1],[46,1],[46,1],[46,1],[46,1],[48,5],[48,5],[47,1],[47,0],[57,3],[57,1],[27,1],[27,0],[59,3],[59,1],[26,1]],performAction:function(t,n,r,i,s,o,u){var a=o.length-1;switch(s){case 1:case 2:case 3:return o[a-1];case 4:this.$=[];break;case 5:case 48:this.$=o[a-1];break;case 6:case 65:case 69:this.$=[];break;case 8:o[a-1]===J.no_op()?this.$=o[a]:this.$=J.pair(o[a-1],o[a]);break;case 9:o[a]===J.no_op()?this.$=[]:this.$=J.pair(o[a],[]);break;case 17:this.$=J.no_op();break;case 18:case 19:case 20:case 21:this.$=J.if_statement(o[a-4],o[a-2],o[a],r);break;case 22:case 23:this.$=J.if_statement(o[a-4],o[a-2],J.pair(o[a],[]),r);break;case 24:case 25:this.$=J.while_statement(o[a-2],o[a],r);break;case 26:case 27:this.$=J.variable_definition(o[a-4],J.function_definition(o[a-4],o[a-2],o[a],u[a-5],u[a]),r);break;case 28:this.$=J.return_statement(o[a],r);break;case 29:this.$=J.variable_definition(o[a-2],o[a],r);break;case 30:o[a-2].tag==="variable"?this.$=J.assignment(o[a-2],o[a],r):error("parse error in line "+r+": "+t);break;case 31:case 32:case 33:case 34:case 35:case 41:case 42:case 43:case 44:case 45:case 46:this.$=J.eager_binary_expression(o[a-2],o[a-1],o[a],r);break;case 36:case 37:this.$=J.eager_binary_expression(0,o[a-1],o[a],r);break;case 38:this.$=J.eager_unary_expression(o[a-1],o[a],r);break;case 39:case 40:this.$=J.boolean_operation(o[a-2],o[a-1],o[a],r);break;case 47:this.$=J.property_access(o[a-2],o[a],r);break;case 50:this.$=J.variable(o[a],r);break;case 51:this.$=J.application(o[a-4],o[a-1],r);break;case 52:this.$=J.application(J.variable(o[a-3],r),o[a-1],r);break;case 53:this.$=J.object_method_application(o[a-5],o[a-3],o[a-1],r);break;case 55:this.$=J.ternary(o[a-4],o[a-2],o[a],r);break;case 56:case 72:this.$=t;break;case 57:this.$=parseFloat(t);break;case 58:this.$=parseInt(t,10);break;case 59:this.$=!0;break;case 60:this.$=!1;break;case 61:this.$=J.empty_list(r);break;case 62:case 63:this.$=J.function_definition("lambda",o[a-2],o[a],u[a-4],u[a]);break;case 64:case 68:this.$=o[a];break;case 66:case 70:this.$=J.pair(o[a-2],o[a]);break;case 67:case 71:this.$=J.pair(o[a],[])}},table:[{3:1,4:2,5:[2,6],6:3,7:4,8:n,10:5,11:7,12:8,13:9,14:10,15:11,16:r,17:12,18:13,19:14,20:i,21:s,24:o,25:u,26:26,28:a,29:f,31:l,32:c,36:h,46:25,48:27,51:p,52:d,53:v,54:m,55:g,56:y,60:b},{1:[3]},{5:[1,35]},{5:[1,36]},{5:[1,37]},{5:[2,7]},{9:[1,39],10:38,11:7,12:8,13:9,14:10,15:11,16:r,17:12,18:13,19:14,20:i,21:s,24:o,25:u,26:26,28:a,29:f,31:l,32:c,36:h,46:25,48:27,51:p,52:d,53:v,54:m,55:g,56:y,60:b},t(w,[2,9],{11:7,12:8,13:9,14:10,15:11,17:12,18:13,19:14,46:25,26:26,48:27,10:40,16:r,20:i,21:s,24:o,25:u,28:a,29:f,31:l,32:c,36:h,51:p,52:d,53:v,54:m,55:g,56:y,60:b}),t(E,[2,10]),t(E,[2,11]),t(E,[2,12]),{16:[1,41]},{16:[1,42]},{16:[1,43]},{16:[1,44],30:[1,45],31:S,32:x,33:T,34:N,35:C,37:k,38:L,39:A,40:O,41:M,42:_,43:D,44:P,45:H,49:B},t(E,[2,17]),{21:[1,61]},{21:[1,62]},{21:j,26:63,60:b},{19:65,21:s,25:F,26:26,31:l,32:c,36:h,46:25,48:27,51:p,52:d,53:v,54:m,55:g,56:y,60:b},{26:67,60:b},{19:68,21:s,25:F,26:26,31:l,32:c,36:h,46:25,48:27,51:p,52:d,53:v,54:m,55:g,56:y,60:b},{19:69,21:s,25:F,26:26,31:l,32:c,36:h,46:25,48:27,51:p,52:d,53:v,54:m,55:g,56:y,60:b},{19:70,21:s,25:F,26:26,31:l,32:c,36:h,46:25,48:27,51:p,52:d,53:v,54:m,55:g,56:y,60:b},{19:71,21:s,25:F,26:26,31:l,32:c,36:h,46:25,48:27,51:p,52:d,53:v,54:m,55:g,56:y,60:b},t(I,[2,49]),t(I,[2,50],{21:[1,72]}),t(I,[2,54]),t(I,[2,56]),t(I,[2,57]),t(I,[2,58]),t(I,[2,59]),t(I,[2,60]),t(I,[2,61]),t([16,21,22,30,31,32,33,34,35,37,38,39,40,41,42,43,44,45,49,50,58],[2,72]),{1:[2,1]},{1:[2,2]},{1:[2,3]},{9:[1,73]},t(q,[2,4]),t(w,[2,8]),t(E,[2,13]),t(E,[2,14]),t(E,[2,15]),t(E,[2,16]),{19:74,21:s,25:F,26:26,31:l,32:c,36:h,46:25,48:27,51:p,52:d,53:v,54:m,55:g,56:y,60:b},{19:75,21:s,25:F,26:26,31:l,32:c,36:h,46:25,48:27,51:p,52:d,53:v,54:m,55:g,56:y,60:b},{19:76,21:s,25:F,26:26,31:l,32:c,36:h,46:25,48:27,51:p,52:d,53:v,54:m,55:g,56:y,60:b},{19:77,21:s,25:F,26:26,31:l,32:c,36:h,46:25,48:27,51:p,52:d,53:v,54:m,55:g,56:y,60:b},{19:78,21:s,25:F,26:26,31:l,32:c,36:h,46:25,48:27,51:p,52:d,53:v,54:m,55:g,56:y,60:b},{19:79,21:s,25:F,26:26,31:l,32:c,36:h,46:25,48:27,51:p,52:d,53:v,54:m,55:g,56:y,60:b},{19:80,21:s,25:F,26:26,31:l,32:c,36:h,46:25,48:27,51:p,52:d,53:v,54:m,55:g,56:y,60:b},{19:81,21:s,25:F,26:26,31:l,32:c,36:h,46:25,48:27,51:p,52:d,53:v,54:m,55:g,56:y,60:b},{19:82,21:s,25:F,26:26,31:l,32:c,36:h,46:25,48:27,51:p,52:d,53:v,54:m,55:g,56:y,60:b},{19:83,21:s,25:F,26:26,31:l,32:c,36:h,46:25,48:27,51:p,52:d,53:v,54:m,55:g,56:y,60:b},{19:84,21:s,25:F,26:26,31:l,32:c,36:h,46:25,48:27,51:p,52:d,53:v,54:m,55:g,56:y,60:b},{19:85,21:s,25:F,26:26,31:l,32:c,36:h,46:25,48:27,51:p,52:d,53:v,54:m,55:g,56:y,60:b},{19:86,21:s,25:F,26:26,31:l,32:c,36:h,46:25,48:27,51:p,52:d,53:v,54:m,55:g,56:y,60:b},{19:87,21:s,25:F,26:26,31:l,32:c,36:h,46:25,48:27,51:p,52:d,53:v,54:m,55:g,56:y,60:b},{26:88,60:b},{19:89,21:s,25:F,26:26,31:l,32:c,36:h,46:25,48:27,51:p,52:d,53:v,54:m,55:g,56:y,60:b},{19:90,21:s,25:F,26:26,31:l,32:c,36:h,46:25,48:27,51:p,52:d,53:v,54:m,55:g,56:y,60:b},{19:91,21:s,25:F,26:26,31:l,32:c,36:h,46:25,48:27,51:p,52:d,53:v,54:m,55:g,56:y,60:b},{21:[1,92]},{22:R,26:95,27:93,59:94,60:b},{16:[2,28],31:S,32:x,33:T,34:N,35:C,37:k,38:L,39:A,40:O,41:M,42:_,43:D,44:P,45:H,49:B},{21:j},{30:[1,96]},t(U,[2,36],{45:H}),t(U,[2,37],{45:H}),t(U,[2,38],{45:H}),{22:[1,97],31:S,32:x,33:T,34:N,35:C,37:k,38:L,39:A,40:O,41:M,42:_,43:D,44:P,45:H,49:B},{19:100,21:s,22:z,25:F,26:26,31:l,32:c,36:h,46:25,47:98,48:27,51:p,52:d,53:v,54:m,55:g,56:y,57:99,60:b},t(q,[2,5]),{16:[2,30],31:S,32:x,33:T,34:N,35:C,37:k,38:L,39:A,40:O,41:M,42:_,43:D,44:P,45:H,49:B},t(W,[2,31],{33:T,34:N,35:C,45:H}),t(W,[2,32],{33:T,34:N,35:C,45:H}),t(U,[2,33],{45:H}),t(U,[2,34],{45:H}),t(U,[2,35],{45:H}),t([16,22,30,37,38,49,50,58],[2,39],{31:S,32:x,33:T,34:N,35:C,39:A,40:O,41:M,42:_,43:D,44:P,45:H}),t([16,22,30,38,49,50,58],[2,40],{31:S,32:x,33:T,34:N,35:C,37:k,39:A,40:O,41:M,42:_,43:D,44:P,45:H}),t(X,[2,41],{31:S,32:x,33:T,34:N,35:C,41:M,42:_,43:D,44:P,45:H}),t(X,[2,42],{31:S,32:x,33:T,34:N,35:C,41:M,42:_,43:D,44:P,45:H}),t(V,[2,43],{31:S,32:x,33:T,34:N,35:C,45:H}),t(V,[2,44],{31:S,32:x,33:T,34:N,35:C,45:H}),t(V,[2,45],{31:S,32:x,33:T,34:N,35:C,45:H}),t(V,[2,46],{31:S,32:x,33:T,34:N,35:C,45:H}),t(I,[2,47],{21:[1,101]}),{31:S,32:x,33:T,34:N,35:C,37:k,38:L,39:A,40:O,41:M,42:_,43:D,44:P,45:H,49:B,50:[1,102]},{22:[1,103],31:S,32:x,33:T,34:N,35:C,37:k,38:L,39:A,40:O,41:M,42:_,43:D,44:P,45:H,49:B},{22:[1,104],31:S,32:x,33:T,34:N,35:C,37:k,38:L,39:A,40:O,41:M,42:_,43:D,44:P,45:H,49:B},{22:R,26:95,27:105,59:94,60:b},{22:[1,106]},{22:[2,68]},{22:[2,71],58:[1,107]},{19:108,21:s,25:F,26:26,31:l,32:c,36:h,46:25,48:27,51:p,52:d,53:v,54:m,55:g,56:y,60:b},t(I,[2,48],{21:[1,109]}),{22:[1,110]},{22:[2,64]},{22:[2,67],31:S,32:x,33:T,34:N,35:C,37:k,38:L,39:A,40:O,41:M,42:_,43:D,44:P,45:H,49:B,58:[1,111]},{19:100,21:s,22:z,25:F,26:26,31:l,32:c,36:h,46:25,47:112,48:27,51:p,52:d,53:v,54:m,55:g,56:y,57:99,60:b},{19:113,21:s,25:F,26:26,31:l,32:c,36:h,46:25,48:27,51:p,52:d,53:v,54:m,55:g,56:y,60:b},{6:114,7:115,8:n},{6:116,7:117,8:n},{22:[1,118]},{6:119,7:120,8:n},{26:95,59:121,60:b},{16:[2,29],31:S,32:x,33:T,34:N,35:C,37:k,38:L,39:A,40:O,41:M,42:_,43:D,44:P,45:H,49:B},{19:100,21:s,22:z,25:F,26:26,31:l,32:c,36:h,46:25,47:122,48:27,51:p,52:d,53:v,54:m,55:g,56:y,57:99,60:b},t(I,[2,52]),{19:100,21:s,25:F,26:26,31:l,32:c,36:h,46:25,48:27,51:p,52:d,53:v,54:m,55:g,56:y,57:123,60:b},{22:[1,124]},t([16,22,30,50,58],[2,55],{31:S,32:x,33:T,34:N,35:C,37:k,38:L,39:A,40:O,41:M,42:_,43:D,44:P,45:H,49:B}),{23:[1,125]},{23:[1,126]},t(E,[2,24]),t(E,[2,25]),{6:127,7:128,8:n},t(I,[2,62]),t(I,[2,63]),{22:[2,70]},{22:[1,129]},{22:[2,66]},t(I,[2,53]),{6:130,7:131,8:n,12:132,20:i},{6:133,7:134,8:n,12:135,20:i},t(E,[2,26]),t(E,[2,27]),t(I,[2,51]),t(E,[2,18]),t(E,[2,19]),t(E,[2,22]),t(E,[2,20]),t(E,[2,21]),t(E,[2,23])],defaultActions:{5:[2,7],35:[2,1],36:[2,2],37:[2,3],94:[2,68],99:[2,64],121:[2,70],123:[2,66]},parseError:function(t,n){if(!n.recoverable){function r(e,t){this.message=e,this.hash=t}throw r.prototype=new Error,new r(t,n)}this.trace(t)},parse:function(t){function w(e){r.length=r.length-2*e,s.length=s.length-e,o.length=o.length-e}var n=this,r=[0],i=[],s=[null],o=[],u=this.table,a="",f=0,l=0,c=0,h=2,p=1,d=o.slice.call(arguments,1),v=Object.create(this.lexer),m={yy:{}};for(var g in this.yy)Object.prototype.hasOwnProperty.call(this.yy,g)&&(m.yy[g]=this.yy[g]);v.setInput(t,m.yy),m.yy.lexer=v,m.yy.parser=this,typeof v.yylloc=="undefined"&&(v.yylloc={});var y=v.yylloc;o.push(y);var b=v.options&&v.options.ranges;typeof m.yy.parseError=="function"?this.parseError=m.yy.parseError:this.parseError=Object.getPrototypeOf(this).parseError;function E(){var e;return e=v.lex()||p,typeof e!="number"&&(e=n.symbols_[e]||e),e}var S,x,T,N,C,k,L={},A,O,M,_;for(;;){T=r[r.length-1];if(this.defaultActions[T])N=this.defaultActions[T];else{if(S===null||typeof S=="undefined")S=E();N=u[T]&&u[T][S]}if(typeof N=="undefined"||!N.length||!N[0]){var D="";_=[];for(A in u[T])this.terminals_[A]&&A>h&&_.push("'"+this.terminals_[A]+"'");v.showPosition?D="Parse error on line "+(f+1)+":\n"+v.showPosition()+"\nExpecting "+_.join(", ")+", got '"+(this.terminals_[S]||S)+"'":D="Parse error on line "+(f+1)+": Unexpected "+(S==p?"end of input":"'"+(this.terminals_[S]||S)+"'"),this.parseError(D,{text:v.match,token:this.terminals_[S]||S,line:v.yylineno,loc:y,expected:_})}if(N[0]instanceof Array&&N.length>1)throw new Error("Parse Error: multiple actions possible at state: "+T+", token: "+S);switch(N[0]){case 1:r.push(S),s.push(v.yytext),o.push(v.yylloc),r.push(N[1]),S=null,x?(S=x,x=null):(l=v.yyleng,a=v.yytext,f=v.yylineno,y=v.yylloc,c>0&&c--);break;case 2:O=this.productions_[N[1]][1],L.$=s[s.length-O],L._$={first_line:o[o.length-(O||1)].first_line,last_line:o[o.length-1].last_line,first_column:o[o.length-(O||1)].first_column,last_column:o[o.length-1].last_column},b&&(L._$.range=[o[o.length-(O||1)].range[0],o[o.length-1].range[1]]),k=this.performAction.apply(L,[a,l,f,m.yy,N[1],s,o].concat(d));if(typeof k!="undefined")return k;O&&(r=r.slice(0,-1*O*2),s=s.slice(0,-1*O),o=o.slice(0,-1*O)),r.push(this.productions_[N[1]][0]),s.push(L.$),o.push(L._$),M=u[r[r.length-2]][r[r.length-1]],r.push(M);break;case 3:return!0}}return!0}},J=e("lib/parser/nodes"),K=function(){var e={EOF:1,parseError:function(t,n){if(!this.yy.parser)throw new Error(t);this.yy.parser.parseError(t,n)},setInput:function(e,t){return this.yy=t||this.yy||{},this._input=e,this._more=this._backtrack=this.done=!1,this.yylineno=this.yyleng=0,this.yytext=this.matched=this.match="",this.conditionStack=["INITIAL"],this.yylloc={first_line:1,first_column:0,last_line:1,last_column:0},this.options.ranges&&(this.yylloc.range=[0,0]),this.offset=0,this},input:function(){var e=this._input[0];this.yytext+=e,this.yyleng++,this.offset++,this.match+=e,this.matched+=e;var t=e.match(/(?:\r\n?|\n).*/g);return t?(this.yylineno++,this.yylloc.last_line++):this.yylloc.last_column++,this.options.ranges&&this.yylloc.range[1]++,this._input=this._input.slice(1),e},unput:function(e){var t=e.length,n=e.split(/(?:\r\n?|\n)/g);this._input=e+this._input,this.yytext=this.yytext.substr(0,this.yytext.length-t),this.offset-=t;var r=this.match.split(/(?:\r\n?|\n)/g);this.match=this.match.substr(0,this.match.length-1),this.matched=this.matched.substr(0,this.matched.length-1),n.length-1&&(this.yylineno-=n.length-1);var i=this.yylloc.range;return this.yylloc={first_line:this.yylloc.first_line,last_line:this.yylineno+1,first_column:this.yylloc.first_column,last_column:n?(n.length===r.length?this.yylloc.first_column:0)+r[r.length-n.length].length-n[0].length:this.yylloc.first_column-t},this.options.ranges&&(this.yylloc.range=[i[0],i[0]+this.yyleng-t]),this.yyleng=this.yytext.length,this},more:function(){return this._more=!0,this},reject:function(){return this.options.backtrack_lexer?(this._backtrack=!0,this):this.parseError("Lexical error on line "+(this.yylineno+1)+". You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).\n"+this.showPosition(),{text:"",token:null,line:this.yylineno})},less:function(e){this.unput(this.match.slice(e))},pastInput:function(){var e=this.matched.substr(0,this.matched.length-this.match.length);return(e.length>20?"...":"")+e.substr(-20).replace(/\n/g,"")},upcomingInput:function(){var e=this.match;return e.length<20&&(e+=this._input.substr(0,20-e.length)),(e.substr(0,20)+(e.length>20?"...":"")).replace(/\n/g,"")},showPosition:function(){var e=this.pastInput(),t=(new Array(e.length+1)).join("-");return e+this.upcomingInput()+"\n"+t+"^"},test_match:function(e,t){var n,r,i;this.options.backtrack_lexer&&(i={yylineno:this.yylineno,yylloc:{first_line:this.yylloc.first_line,last_line:this.last_line,first_column:this.yylloc.first_column,last_column:this.yylloc.last_column},yytext:this.yytext,match:this.match,matches:this.matches,matched:this.matched,yyleng:this.yyleng,offset:this.offset,_more:this._more,_input:this._input,yy:this.yy,conditionStack:this.conditionStack.slice(0),done:this.done},this.options.ranges&&(i.yylloc.range=this.yylloc.range.slice(0))),r=e[0].match(/(?:\r\n?|\n).*/g),r&&(this.yylineno+=r.length),this.yylloc={first_line:this.yylloc.last_line,last_line:this.yylineno+1,first_column:this.yylloc.last_column,last_column:r?r[r.length-1].length-r[r.length-1].match(/\r?\n?/)[0].length:this.yylloc.last_column+e[0].length},this.yytext+=e[0],this.match+=e[0],this.matches=e,this.yyleng=this.yytext.length,this.options.ranges&&(this.yylloc.range=[this.offset,this.offset+=this.yyleng]),this._more=!1,this._backtrack=!1,this._input=this._input.slice(e[0].length),this.matched+=e[0],n=this.performAction.call(this,this.yy,this,t,this.conditionStack[this.conditionStack.length-1]),this.done&&this._input&&(this.done=!1);if(n)return n;if(this._backtrack){for(var s in i)this[s]=i[s];return!1}return!1},next:function(){if(this.done)return this.EOF;this._input||(this.done=!0);var e,t,n,r;this._more||(this.yytext="",this.match="");var i=this._currentRules();for(var s=0;s<i.length;s++){n=this._input.match(this.rules[i[s]]);if(n&&(!t||n[0].length>t[0].length)){t=n,r=s;if(this.options.backtrack_lexer){e=this.test_match(n,i[s]);if(e!==!1)return e;if(this._backtrack){t=!1;continue}return!1}if(!this.options.flex)break}}return t?(e=this.test_match(t,i[r]),e!==!1?e:!1):this._input===""?this.EOF:this.parseError("Lexical error on line "+(this.yylineno+1)+". Unrecognized text.\n"+this.showPosition(),{text:"",token:null,line:this.yylineno})},lex:function(){var t=this.next();return t?t:this.lex()},begin:function(t){this.conditionStack.push(t)},popState:function(){var t=this.conditionStack.length-1;return t>0?this.conditionStack.pop():this.conditionStack[0]},_currentRules:function(){return this.conditionStack.length&&this.conditionStack[this.conditionStack.length-1]?this.conditions[this.conditionStack[this.conditionStack.length-1]].rules:this.conditions.INITIAL.rules},topState:function(t){return t=this.conditionStack.length-1-Math.abs(t||0),t>=0?this.conditionStack[t]:"INITIAL"},pushState:function(t){this.begin(t)},stateStackSize:function(){return this.conditionStack.length},options:{},performAction:function(t,n,r,i){var s=i;switch(r){case 0:break;case 1:break;case 2:break;case 3:return 25;case 4:return"INVALID";case 5:return 28;case 6:return 20;case 7:return 23;case 8:return 24;case 9:return"for";case 10:return"case";case 11:return"default";case 12:return"new";case 13:return"break";case 14:return"continue";case 15:return 29;case 16:return 39;case 17:return 30;case 18:return 8;case 19:return 9;case 20:return 16;case 21:return 58;case 22:return 54;case 23:return 55;case 24:return 56;case 25:return"[";case 26:return"]";case 27:return 45;case 28:this.begin("DoubleQuotedString"),this.string="";break;case 29:this.begin("SingleQuotedString"),this.string="";break;case 30:this.begin("QuotedStringEscape");break;case 31:return n.yytext=this.string,this.string=undefined,this.popState(),51;case 32:return n.yytext=this.string,this.string=undefined,this.popState(),51;case 33:switch(n.yytext){case"\r\n":case"\n":break;case"b":this.string+="\b";break;case"n":this.string+="\n";break;case"r":this.string+="\r";break;case"t":this.string+="	";break;case"'":this.string+="'";break;case'"':this.string+='"';break;case"\\":this.string+="\\";break;default:this.string+="\\"+$1}this.popState();break;case 34:this.string+=n.yytext;break;case 35:this.string+=n.yytext;break;case 36:return 60;case 37:return 52;case 38:return 53;case 39:return 31;case 40:return 32;case 41:return 33;case 42:return 34;case 43:return 35;case 44:return 40;case 45:return 44;case 46:return 43;case 47:return 42;case 48:return 41;case 49:return 36;case 50:return 37;case 51:return 38;case 52:return 21;case 53:return 22;case 54:return 49;case 55:return 50;case 56:return 5;case 57:return"INVALID"}},rules:[/^(?:\/\/([^\n\r]*))/,/^(?:\/\*([\u0000-\uffff]*?)\*\/)/,/^(?:\s+)/,/^(?:function\b)/,/^(?:return\s*\n)/,/^(?:return\b)/,/^(?:if\b)/,/^(?:else\b)/,/^(?:while\b)/,/^(?:for\b)/,/^(?:case\b)/,/^(?:default\b)/,/^(?:new\b)/,/^(?:break\b)/,/^(?:continue\b)/,/^(?:var\b)/,/^(?:===)/,/^(?:=)/,/^(?:\{)/,/^(?:\})/,/^(?:;)/,/^(?:,)/,/^(?:true\b)/,/^(?:false\b)/,/^(?:\[\])/,/^(?:\[)/,/^(?:\])/,/^(?:\.)/,/^(?:")/,/^(?:')/,/^(?:\\)/,/^(?:")/,/^(?:')/,/^(?:(.|\r\n|\n))/,/^(?:[^"\\]*)/,/^(?:[^'\\]*)/,/^(?:[A-Za-z_][A-Za-z0-9_]*)/,/^(?:[0-9]+(\.[0-9]+)?([eE][\-+]?[0-9]+)?\b)/,/^(?:[0-9]+\b)/,/^(?:\+)/,/^(?:-)/,/^(?:\*)/,/^(?:\/)/,/^(?:%)/,/^(?:!==)/,/^(?:<=)/,/^(?:>=)/,/^(?:<)/,/^(?:>)/,/^(?:!)/,/^(?:&&)/,/^(?:\|\|)/,/^(?:\()/,/^(?:\))/,/^(?:\?)/,/^(?::)/,/^(?:$)/,/^(?:.)/],conditions:{QuotedStringEscape:{rules:[33],inclusive:!1},SingleQuotedString:{rules:[30,32,35],inclusive:!1},DoubleQuotedString:{rules:[30,31,34],inclusive:!1},INITIAL:{rules:[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57],inclusive:!0}}};return e}();return $.lexer=K,$.lexer.options.ranges=!0,$}),n("lib/parser/parser-week-9.js",["require","lib/parser/nodes"],function(e){var t=function(e,t,n,r){for(n=n||{},r=e.length;r--;n[e[r]]=t);return n},n=[1,15],r=[1,16],i=[1,24],s=[1,17],o=[1,18],u=[1,19],a=[1,20],f=[1,22],l=[1,21],c=[1,23],h=[1,28],p=[1,30],d=[1,31],v=[1,32],m=[1,33],g=[1,34],y=[1,35],b=[1,36],w=[16,30,31,32,33,34,35,37,38,39,40,41,42,43,44,45,47,53],E=[2,66],S=[1,45],x=[1,41],T=[5,9],N=[5,8,9,16,20,21,24,25,28,29,31,32,36,51,55,56,57,58,59,60,66],C=[1,53],k=[1,54],L=[1,55],A=[1,56],O=[1,57],M=[1,58],_=[1,59],D=[1,60],P=[1,61],H=[1,62],B=[1,63],j=[1,64],F=[1,65],I=[1,66],q=[1,67],R=[1,68],U=[1,72],z=[1,74],W=[9,16,22,30,31,32,33,34,35,37,38,39,40,41,42,43,44,45,46,47,53,54,63],X=[2,51],V=[1,80],$=[5,8,9,16,20,21,22,23,24,25,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,51,53,54,55,56,57,58,59,60,63,66],J=[1,85],K=[2,77],Q=[9,16,22,30,31,32,33,34,35,37,38,39,40,41,42,43,44,46,53,54,63],G=[2,73],Y=[9,16,22,30,31,32,37,38,39,40,41,42,43,44,46,53,54,63],Z=[9,16,22,30,37,38,39,40,46,53,54,63],et=[9,16,22,30,37,38,39,40,41,42,43,44,46,53,54,63],tt=[1,135],nt={trace:function(){},yy:{},symbols_:{error:2,program:3,statements:4,EOF:5,statement_block:6,empty_block:7,"{":8,"}":9,non_empty_statements:10,statement:11,if_statement:12,while_statement:13,function_definition:14,return_statement:15,";":16,variable_definition:17,assignment_statement:18,expression:19,"if":20,"(":21,")":22,"else":23,"while":24,"function":25,identifier:26,identifiers:27,"return":28,"var":29,"=":30,"+":31,"-":32,"*":33,"/":34,"%":35,"!":36,"&&":37,"||":38,"===":39,"!==":40,">":41,"<":42,">=":43,"<=":44,"[":45,"]":46,".":47,constants:48,expressions:49,object_literal:50,"new":51,function_expression:52,"?":53,":":54,STRING:55,FLOAT_NUMBER:56,INT_NUMBER:57,"true":58,"false":59,empty_list:60,non_empty_object_literal_statements:61,object_literal_statement:62,",":63,non_empty_expressions:64,non_empty_identifiers:65,Identifier:66,$accept:0,$end:1},terminals_:{2:"error",5:"EOF",8:"{",9:"}",16:";",20:"if",21:"(",22:")",23:"else",24:"while",25:"function",28:"return",29:"var",30:"=",31:"+",32:"-",33:"*",34:"/",35:"%",36:"!",37:"&&",38:"||",39:"===",40:"!==",41:">",42:"<",43:">=",44:"<=",45:"[",46:"]",47:".",51:"new",53:"?",54:":",55:"STRING",56:"FLOAT_NUMBER",57:"INT_NUMBER",58:"true",59:"false",60:"empty_list",63:",",66:"Identifier"},productions_:[0,[3,2],[3,2],[3,2],[7,2],[6,3],[4,0],[4,1],[10,2],[10,1],[11,1],[11,1],[11,1],[11,2],[11,2],[11,2],[11,2],[11,1],[12,7],[12,7],[12,7],[12,7],[12,7],[12,7],[13,5],[13,5],[14,6],[14,6],[15,2],[17,4],[18,3],[19,3],[19,3],[19,3],[19,3],[19,3],[19,2],[19,2],[19,2],[19,3],[19,3],[19,3],[19,3],[19,3],[19,3],[19,3],[19,3],[19,4],[19,3],[19,3],[19,1],[19,1],[19,6],[19,1],[19,4],[19,6],[19,5],[19,1],[19,5],[48,1],[48,1],[48,1],[48,1],[48,1],[48,1],[50,3],[50,1],[61,3],[61,1],[62,3],[52,5],[52,5],[49,1],[49,0],[64,3],[64,1],[27,1],[27,0],[65,3],[65,1],[26,1]],performAction:function(t,n,r,i,s,o,u){var a=o.length-1;switch(s){case 1:case 2:case 3:return o[a-1];case 4:this.$=[];break;case 5:case 49:this.$=o[a-1];break;case 6:case 73:case 77:this.$=[];break;case 8:o[a-1]===rt.no_op()?this.$=o[a]:this.$=rt.pair(o[a-1],o[a]);break;case 9:o[a]===rt.no_op()?this.$=[]:this.$=rt.pair(o[a],[]);break;case 17:this.$=rt.no_op();break;case 18:case 19:case 20:case 21:this.$=rt.if_statement(o[a-4],o[a-2],o[a],r);break;case 22:case 23:this.$=rt.if_statement(o[a-4],o[a-2],rt.pair(o[a],[]),r);break;case 24:case 25:this.$=rt.while_statement(o[a-2],o[a],r);break;case 26:case 27:this.$=rt.variable_definition(o[a-4],rt.function_definition(o[a-4],o[a-2],o[a],u[a-5],u[a]),r);break;case 28:this.$=rt.return_statement(o[a],r);break;case 29:this.$=rt.variable_definition(o[a-2],o[a],r);break;case 30:o[a-2].tag==="variable"?this.$=rt.assignment(o[a-2],o[a],r):o[a-2].tag==="property_access"?this.$=rt.property_assignment(o[a-2].object,o[a-2].property,o[a],r):error("parse error in line "+r+": "+t);break;case 31:case 32:case 33:case 34:case 35:case 41:case 42:case 43:case 44:case 45:case 46:this.$=rt.eager_binary_expression(o[a-2],o[a-1],o[a],r);break;case 36:case 37:this.$=rt.eager_binary_expression(0,o[a-1],o[a],r);break;case 38:this.$=rt.eager_unary_expression(o[a-1],o[a],r);break;case 39:case 40:this.$=rt.boolean_operation(o[a-2],o[a-1],o[a],r);break;case 47:this.$=rt.property_access(o[a-3],o[a-1],r);break;case 48:this.$=rt.property_access(o[a-2],o[a],r);break;case 51:this.$=rt.variable(o[a],r);break;case 52:this.$=rt.application(o[a-4],o[a-1],r);break;case 54:this.$=rt.application(rt.variable(o[a-3],r),o[a-1],r);break;case 55:this.$=rt.object_method_application(o[a-5],o[a-3],o[a-1],r);break;case 56:this.$=rt.construction(o[a-3],o[a-1],r);break;case 58:this.$=rt.ternary(o[a-4],o[a-2],o[a],r);break;case 59:case 80:this.$=t;break;case 60:this.$=parseFloat(t);break;case 61:this.$=parseInt(t,10);break;case 62:this.$=!0;break;case 63:this.$=!1;break;case 64:this.$=rt.empty_list(r);break;case 65:this.$=rt.object_literal(o[a-1],r);break;case 66:this.$=rt.object_literal([],r);break;case 67:case 69:case 74:case 78:this.$=rt.pair(o[a-2],o[a]);break;case 68:case 75:case 79:this.$=rt.pair(o[a],[]);break;case 70:case 71:this.$=rt.function_definition("lambda",o[a-2],o[a],u[a-4],u[a]);break;case 72:case 76:this.$=o[a]}},table:[{3:1,4:2,5:[2,6],6:3,7:4,8:[1,6],10:5,11:7,12:8,13:9,14:10,15:11,16:n,17:12,18:13,19:14,20:r,21:i,24:s,25:o,26:26,28:u,29:a,31:f,32:l,36:c,48:25,50:27,51:h,52:29,55:p,56:d,57:v,58:m,59:g,60:y,66:b},{1:[3]},{5:[1,37]},{5:[1,38]},t(w,E,{5:[1,39]}),{5:[2,7]},{7:46,8:S,9:x,10:40,11:7,12:8,13:9,14:10,15:11,16:n,17:12,18:13,19:14,20:r,21:i,24:s,25:o,26:44,28:u,29:a,31:f,32:l,36:c,48:25,50:27,51:h,52:29,55:p,56:d,57:v,58:m,59:g,60:y,61:42,62:43,66:b},t(T,[2,9],{11:7,12:8,13:9,14:10,15:11,17:12,18:13,19:14,48:25,26:26,50:27,52:29,7:46,10:47,8:S,16:n,20:r,21:i,24:s,25:o,28:u,29:a,31:f,32:l,36:c,51:h,55:p,56:d,57:v,58:m,59:g,60:y,66:b}),t(N,[2,10]),t(N,[2,11]),t(N,[2,12]),{16:[1,48]},{16:[1,49]},{16:[1,50]},{16:[1,51],30:[1,52],31:C,32:k,33:L,34:A,35:O,37:M,38:_,39:D,40:P,41:H,42:B,43:j,44:F,45:I,47:q,53:R},t(N,[2,17]),{21:[1,69]},{21:[1,70]},{21:U,26:71,66:b},{7:46,8:S,19:73,21:i,25:z,26:26,31:f,32:l,36:c,48:25,50:27,51:h,52:29,55:p,56:d,57:v,58:m,59:g,60:y,66:b},{26:75,66:b},{7:46,8:S,19:76,21:i,25:z,26:26,31:f,32:l,36:c,48:25,50:27,51:h,52:29,55:p,56:d,57:v,58:m,59:g,60:y,66:b},{7:46,8:S,19:77,21:i,25:z,26:26,31:f,32:l,36:c,48:25,50:27,51:h,52:29,55:p,56:d,57:v,58:m,59:g,60:y,66:b},{7:46,8:S,19:78,21:i,25:z,26:26,31:f,32:l,36:c,48:25,50:27,51:h,52:29,55:p,56:d,57:v,58:m,59:g,60:y,66:b},{7:46,8:S,19:79,21:i,25:z,26:26,31:f,32:l,36:c,48:25,50:27,51:h,52:29,55:p,56:d,57:v,58:m,59:g,60:y,66:b},t(W,[2,50]),t(W,X,{21:V}),t(W,[2,53]),{26:81,66:b},t(W,[2,57]),t(W,[2,59]),t(W,[2,60]),t(W,[2,61]),t(W,[2,62]),t(W,[2,63]),t(W,[2,64]),t([9,16,21,22,30,31,32,33,34,35,37,38,39,40,41,42,43,44,45,46,47,53,54,63],[2,80]),{1:[2,1]},{1:[2,2]},{1:[2,3]},{9:[1,82]},t($,[2,4]),{9:[1,83]},{9:[2,68],63:[1,84]},t(w,X,{21:V,54:J}),{9:x,26:86,61:42,62:43,66:b},t(W,E),t(T,[2,8]),t(N,[2,13]),t(N,[2,14]),t(N,[2,15]),t(N,[2,16]),{7:46,8:S,19:87,21:i,25:z,26:26,31:f,32:l,36:c,48:25,50:27,51:h,52:29,55:p,56:d,57:v,58:m,59:g,60:y,66:b},{7:46,8:S,19:88,21:i,25:z,26:26,31:f,32:l,36:c,48:25,50:27,51:h,52:29,55:p,56:d,57:v,58:m,59:g,60:y,66:b},{7:46,8:S,19:89,21:i,25:z,26:26,31:f,32:l,36:c,48:25,50:27,51:h,52:29,55:p,56:d,57:v,58:m,59:g,60:y,66:b},{7:46,8:S,19:90,21:i,25:z,26:26,31:f,32:l,36:c,48:25,50:27,51:h,52:29,55:p,56:d,57:v,58:m,59:g,60:y,66:b},{7:46,8:S,19:91,21:i,25:z,26:26,31:f,32:l,36:c,48:25,50:27,51:h,52:29,55:p,56:d,57:v,58:m,59:g,60:y,66:b},{7:46,8:S,19:92,21:i,25:z,26:26,31:f,32:l,36:c,48:25,50:27,51:h,52:29,55:p,56:d,57:v,58:m,59:g,60:y,66:b},{7:46,8:S,19:93,21:i,25:z,26:26,31:f,32:l,36:c,48:25,50:27,51:h,52:29,55:p,56:d,57:v,58:m,59:g,60:y,66:b},{7:46,8:S,19:94,21:i,25:z,26:26,31:f,32:l,36:c,48:25,50:27,51:h,52:29,55:p,56:d,57:v,58:m,59:g,60:y,66:b},{7:46,8:S,19:95,21:i,25:z,26:26,31:f,32:l,36:c,48:25,50:27,51:h,52:29,55:p,56:d,57:v,58:m,59:g,60:y,66:b},{7:46,8:S,19:96,21:i,25:z,26:26,31:f,32:l,36:c,48:25,50:27,51:h,52:29,55:p,56:d,57:v,58:m,59:g,60:y,66:b},{7:46,8:S,19:97,21:i,25:z,26:26,31:f,32:l,36:c,48:25,50:27,51:h,52:29,55:p,56:d,57:v,58:m,59:g,60:y,66:b},{7:46,8:S,19:98,21:i,25:z,26:26,31:f,32:l,36:c,48:25,50:27,51:h,52:29,55:p,56:d,57:v,58:m,59:g,60:y,66:b},{7:46,8:S,19:99,21:i,25:z,26:26,31:f,32:l,36:c,48:25,50:27,51:h,52:29,55:p,56:d,57:v,58:m,59:g,60:y,66:b},{7:46,8:S,19:100,21:i,25:z,26:26,31:f,32:l,36:c,48:25,50:27,51:h,52:29,55:p,56:d,57:v,58:m,59:g,60:y,66:b},{7:46,8:S,19:101,21:i,25:z,26:26,31:f,32:l,36:c,48:25,50:27,51:h,52:29,55:p,56:d,57:v,58:m,59:g,60:y,66:b},{26:102,66:b},{7:46,8:S,19:103,21:i,25:z,26:26,31:f,32:l,36:c,48:25,50:27,51:h,52:29,55:p,56:d,57:v,58:m,59:g,60:y,66:b},{7:46,8:S,19:104,21:i,25:z,26:26,31:f,32:l,36:c,48:25,50:27,51:h,52:29,55:p,56:d,57:v,58:m,59:g,60:y,66:b},{7:46,8:S,19:105,21:i,25:z,26:26,31:f,32:l,36:c,48:25,50:27,51:h,52:29,55:p,56:d,57:v,58:m,59:g,60:y,66:b},{21:[1,106]},{22:K,26:109,27:107,65:108,66:b},{16:[2,28],31:C,32:k,33:L,34:A,35:O,37:M,38:_,39:D,40:P,41:H,42:B,43:j,44:F,45:I,47:q,53:R},{21:U},{30:[1,110]},t(Q,[2,36],{45:I,47:q}),t(Q,[2,37],{45:I,47:q}),t(Q,[2,38],{45:I,47:q}),{22:[1,111],31:C,32:k,33:L,34:A,35:O,37:M,38:_,39:D,40:P,41:H,42:B,43:j,44:F,45:I,47:q,53:R},{7:46,8:S,19:114,21:i,22:G,25:z,26:26,31:f,32:l,36:c,48:25,49:112,50:27,51:h,52:29,55:p,56:d,57:v,58:m,59:g,60:y,64:113,66:b},{21:[1,115]},t($,[2,5]),t(W,[2,65]),{26:86,61:116,62:43,66:b},{7:46,8:S,19:117,21:i,25:z,26:26,31:f,32:l,36:c,48:25,50:27,51:h,52:29,55:p,56:d,57:v,58:m,59:g,60:y,66:b},{54:J},{16:[2,30],31:C,32:k,33:L,34:A,35:O,37:M,38:_,39:D,40:P,41:H,42:B,43:j,44:F,45:I,47:q,53:R},t(Y,[2,31],{33:L,34:A,35:O,45:I,47:q}),t(Y,[2,32],{33:L,34:A,35:O,45:I,47:q}),t(Q,[2,33],{45:I,47:q}),t(Q,[2,34],{45:I,47:q}),t(Q,[2,35],{45:I,47:q}),t([9,16,22,30,37,38,46,53,54,63],[2,39],{31:C,32:k,33:L,34:A,35:O,39:D,40:P,41:H,42:B,43:j,44:F,45:I,47:q}),t([9,16,22,30,38,46,53,54,63],[2,40],{31:C,32:k,33:L,34:A,35:O,37:M,39:D,40:P,41:H,42:B,43:j,44:F,45:I,47:q}),t(Z,[2,41],{31:C,32:k,33:L,34:A,35:O,41:H,42:B,43:j,44:F,45:I,47:q}),t(Z,[2,42],{31:C,32:k,33:L,34:A,35:O,41:H,42:B,43:j,44:F,45:I,47:q}),t(et,[2,43],{31:C,32:k,33:L,34:A,35:O,45:I,47:q}),t(et,[2,44],{31:C,32:k,33:L,34:A,35:O,45:I,47:q}),t(et,[2,45],{31:C,32:k,33:L,34:A,35:O,45:I,47:q}),t(et,[2,46],{31:C,32:k,33:L,34:A,35:O,45:I,47:q}),{31:C,32:k,33:L,34:A,35:O,37:M,38:_,39:D,40:P,41:H,42:B,43:j,44:F,45:I,46:[1,118],47:q,53:R},t(W,[2,48],{21:[1,119]}),{31:C,32:k,33:L,34:A,35:O,37:M,38:_,39:D,40:P,41:H,42:B,43:j,44:F,45:I,47:q,53:R,54:[1,120]},{22:[1,121],31:C,32:k,33:L,34:A,35:O,37:M,38:_,39:D,40:P,41:H,42:B,43:j,44:F,45:I,47:q,53:R},{22:[1,122],31:C,32:k,33:L,34:A,35:O,37:M,38:_,39:D,40:P,41:H,42:B,43:j,44:F,45:I,47:q,53:R},{22:K,26:109,27:123,65:108,66:b},{22:[1,124]},{22:[2,76]},{22:[2,79],63:[1,125]},{7:46,8:S,19:126,21:i,25:z,26:26,31:f,32:l,36:c,48:25,50:27,51:h,52:29,55:p,56:d,57:v,58:m,59:g,60:y,66:b},t(W,[2,49],{21:[1,127]}),{22:[1,128]},{22:[2,72]},{22:[2,75],31:C,32:k,33:L,34:A,35:O,37:M,38:_,39:D,40:P,41:H,42:B,43:j,44:F,45:I,47:q,53:R,63:[1,129]},{7:46,8:S,19:114,21:i,22:G,25:z,26:26,31:f,32:l,36:c,48:25,49:130,50:27,51:h,52:29,55:p,56:d,57:v,58:m,59:g,60:y,64:113,66:b},{9:[2,67]},t([9,63],[2,69],{31:C,32:k,33:L,34:A,35:O,37:M,38:_,39:D,40:P,41:H,42:B,43:j,44:F,45:I,47:q,53:R}),t(W,[2,47]),{7:46,8:S,19:114,21:i,22:G,25:z,26:26,31:f,32:l,36:c,48:25,49:131,50:27,51:h,52:29,55:p,56:d,57:v,58:m,59:g,60:y,64:113,66:b},{7:46,8:S,19:132,21:i,25:z,26:26,31:f,32:l,36:c,48:25,50:27,51:h,52:29,55:p,56:d,57:v,58:m,59:g,60:y,66:b},{6:133,7:134,8:tt},{6:136,7:137,8:tt},{22:[1,138]},{6:139,7:140,8:tt},{26:109,65:141,66:b},{16:[2,29],31:C,32:k,33:L,34:A,35:O,37:M,38:_,39:D,40:P,41:H,42:B,43:j,44:F,45:I,47:q,53:R},{7:46,8:S,19:114,21:i,22:G,25:z,26:26,31:f,32:l,36:c,48:25,49:142,50:27,51:h,52:29,55:p,56:d,57:v,58:m,59:g,60:y,64:113,66:b},t(W,[2,54]),{7:46,8:S,19:114,21:i,25:z,26:26,31:f,32:l,36:c,48:25,50:27,51:h,52:29,55:p,56:d,57:v,58:m,59:g,60:y,64:143,66:b},{22:[1,144]},{22:[1,145]},t([9,16,22,30,46,54,63],[2,58],{31:C,32:k,33:L,34:A,35:O,37:M,38:_,39:D,40:P,41:H,42:B,43:j,44:F,45:I,47:q,53:R}),{23:[1,146]},{23:[1,147]},{7:46,8:S,9:x,10:40,11:7,12:8,13:9,14:10,15:11,16:n,17:12,18:13,19:14,20:r,21:i,24:s,25:o,26:26,28:u,29:a,31:f,32:l,36:c,48:25,50:27,51:h,52:29,55:p,56:d,57:v,58:m,59:g,60:y,66:b},t(N,[2,24]),t(N,[2,25]),{6:148,7:149,8:tt},t(W,[2,70]),t(W,[2,71]),{22:[2,78]},{22:[1,150]},{22:[2,74]},t(W,[2,56]),t(W,[2,55]),{6:151,7:152,8:tt,12:153,20:r},{6:154,7:155,8:tt,12:156,20:r},t(N,[2,26]),t(N,[2,27]),t(W,[2,52]),t(N,[2,18]),t(N,[2,19]),t(N,[2,22]),t(N,[2,20]),t(N,[2,21]),t(N,[2,23])],defaultActions:{5:[2,7],37:[2,1],38:[2,2],39:[2,3],108:[2,76],113:[2,72],116:[2,67],141:[2,78],143:[2,74]},parseError:function(t,n){if(!n.recoverable){function r(e,t){this.message=e,this.hash=t}throw r.prototype=new Error,new r(t,n)}this.trace(t)},parse:function(t){function w(e){r.length=r.length-2*e,s.length=s.length-e,o.length=o.length-e}var n=this,r=[0],i=[],s=[null],o=[],u=this.table,a="",f=0,l=0,c=0,h=2,p=1,d=o.slice.call(arguments,1),v=Object.create(this.lexer),m={yy:{}};for(var g in this.yy)Object.prototype.hasOwnProperty.call(this.yy,g)&&(m.yy[g]=this.yy[g]);v.setInput(t,m.yy),m.yy.lexer=v,m.yy.parser=this,typeof v.yylloc=="undefined"&&(v.yylloc={});var y=v.yylloc;o.push(y);var b=v.options&&v.options.ranges;typeof m.yy.parseError=="function"?this.parseError=m.yy.parseError:this.parseError=Object.getPrototypeOf(this).parseError;function E(){var e;return e=v.lex()||p,typeof e!="number"&&(e=n.symbols_[e]||e),e}var S,x,T,N,C,k,L={},A,O,M,_;for(;;){T=r[r.length-1];if(this.defaultActions[T])N=this.defaultActions[T];else{if(S===null||typeof S=="undefined")S=E();N=u[T]&&u[T][S]}if(typeof N=="undefined"||!N.length||!N[0]){var D="";_=[];for(A in u[T])this.terminals_[A]&&A>h&&_.push("'"+this.terminals_[A]+"'");v.showPosition?D="Parse error on line "+(f+1)+":\n"+v.showPosition()+"\nExpecting "+_.join(", ")+", got '"+(this.terminals_[S]||S)+"'":D="Parse error on line "+(f+1)+": Unexpected "+(S==p?"end of input":"'"+(this.terminals_[S]||S)+"'"),this.parseError(D,{text:v.match,token:this.terminals_[S]||S,line:v.yylineno,loc:y,expected:_})}if(N[0]instanceof Array&&N.length>1)throw new Error("Parse Error: multiple actions possible at state: "+T+", token: "+S);switch(N[0]){case 1:r.push(S),s.push(v.yytext),o.push(v.yylloc),r.push(N[1]),S=null,x?(S=x,x=null):(l=v.yyleng,a=v.yytext,f=v.yylineno,y=v.yylloc,c>0&&c--);break;case 2:O=this.productions_[N[1]][1],L.$=s[s.length-O],L._$={first_line:o[o.length-(O||1)].first_line,last_line:o[o.length-1].last_line,first_column:o[o.length-(O||1)].first_column,last_column:o[o.length-1].last_column},b&&(L._$.range=[o[o.length-(O||1)].range[0],o[o.length-1].range[1]]),k=this.performAction.apply(L,[a,l,f,m.yy,N[1],s,o].concat(d));if(typeof k!="undefined")return k;O&&(r=r.slice(0,-1*O*2),s=s.slice(0,-1*O),o=o.slice(0,-1*O)),r.push(this.productions_[N[1]][0]),s.push(L.$),o.push(L._$),M=u[r[r.length-2]][r[r.length-1]],r.push(M);break;case 3:return!0}}return!0}},rt=e("lib/parser/nodes"),it=function(){var e={EOF:1,parseError:function(t,n){if(!this.yy.parser)throw new Error(t);this.yy.parser.parseError(t,n)},setInput:function(e,t){return this.yy=t||this.yy||{},this._input=e,this._more=this._backtrack=this.done=!1,this.yylineno=this.yyleng=0,this.yytext=this.matched=this.match="",this.conditionStack=["INITIAL"],this.yylloc={first_line:1,first_column:0,last_line:1,last_column:0},this.options.ranges&&(this.yylloc.range=[0,0]),this.offset=0,this},input:function(){var e=this._input[0];this.yytext+=e,this.yyleng++,this.offset++,this.match+=e,this.matched+=e;var t=e.match(/(?:\r\n?|\n).*/g);return t?(this.yylineno++,this.yylloc.last_line++):this.yylloc.last_column++,this.options.ranges&&this.yylloc.range[1]++,this._input=this._input.slice(1),e},unput:function(e){var t=e.length,n=e.split(/(?:\r\n?|\n)/g);this._input=e+this._input,this.yytext=this.yytext.substr(0,this.yytext.length-t),this.offset-=t;var r=this.match.split(/(?:\r\n?|\n)/g);this.match=this.match.substr(0,this.match.length-1),this.matched=this.matched.substr(0,this.matched.length-1),n.length-1&&(this.yylineno-=n.length-1);var i=this.yylloc.range;return this.yylloc={first_line:this.yylloc.first_line,last_line:this.yylineno+1,first_column:this.yylloc.first_column,last_column:n?(n.length===r.length?this.yylloc.first_column:0)+r[r.length-n.length].length-n[0].length:this.yylloc.first_column-t},this.options.ranges&&(this.yylloc.range=[i[0],i[0]+this.yyleng-t]),this.yyleng=this.yytext.length,this},more:function(){return this._more=!0,this},reject:function(){return this.options.backtrack_lexer?(this._backtrack=!0,this):this.parseError("Lexical error on line "+(this.yylineno+1)+". You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).\n"+this.showPosition(),{text:"",token:null,line:this.yylineno})},less:function(e){this.unput(this.match.slice(e))},pastInput:function(){var e=this.matched.substr(0,this.matched.length-this.match.length);return(e.length>20?"...":"")+e.substr(-20).replace(/\n/g,"")},upcomingInput:function(){var e=this.match;return e.length<20&&(e+=this._input.substr(0,20-e.length)),(e.substr(0,20)+(e.length>20?"...":"")).replace(/\n/g,"")},showPosition:function(){var e=this.pastInput(),t=(new Array(e.length+1)).join("-");return e+this.upcomingInput()+"\n"+t+"^"},test_match:function(e,t){var n,r,i;this.options.backtrack_lexer&&(i={yylineno:this.yylineno,yylloc:{first_line:this.yylloc.first_line,last_line:this.last_line,first_column:this.yylloc.first_column,last_column:this.yylloc.last_column},yytext:this.yytext,match:this.match,matches:this.matches,matched:this.matched,yyleng:this.yyleng,offset:this.offset,_more:this._more,_input:this._input,yy:this.yy,conditionStack:this.conditionStack.slice(0),done:this.done},this.options.ranges&&(i.yylloc.range=this.yylloc.range.slice(0))),r=e[0].match(/(?:\r\n?|\n).*/g),r&&(this.yylineno+=r.length),this.yylloc={first_line:this.yylloc.last_line,last_line:this.yylineno+1,first_column:this.yylloc.last_column,last_column:r?r[r.length-1].length-r[r.length-1].match(/\r?\n?/)[0].length:this.yylloc.last_column+e[0].length},this.yytext+=e[0],this.match+=e[0],this.matches=e,this.yyleng=this.yytext.length,this.options.ranges&&(this.yylloc.range=[this.offset,this.offset+=this.yyleng]),this._more=!1,this._backtrack=!1,this._input=this._input.slice(e[0].length),this.matched+=e[0],n=this.performAction.call(this,this.yy,this,t,this.conditionStack[this.conditionStack.length-1]),this.done&&this._input&&(this.done=!1);if(n)return n;if(this._backtrack){for(var s in i)this[s]=i[s];return!1}return!1},next:function(){if(this.done)return this.EOF;this._input||(this.done=!0);var e,t,n,r;this._more||(this.yytext="",this.match="");var i=this._currentRules();for(var s=0;s<i.length;s++){n=this._input.match(this.rules[i[s]]);if(n&&(!t||n[0].length>t[0].length)){t=n,r=s;if(this.options.backtrack_lexer){e=this.test_match(n,i[s]);if(e!==!1)return e;if(this._backtrack){t=!1;continue}return!1}if(!this.options.flex)break}}return t?(e=this.test_match(t,i[r]),e!==!1?e:!1):this._input===""?this.EOF:this.parseError("Lexical error on line "+(this.yylineno+1)+". Unrecognized text.\n"+this.showPosition(),{text:"",token:null,line:this.yylineno})},lex:function(){var t=this.next();return t?t:this.lex()},begin:function(t){this.conditionStack.push(t)},popState:function(){var t=this.conditionStack.length-1;return t>0?this.conditionStack.pop():this.conditionStack[0]},_currentRules:function(){return this.conditionStack.length&&this.conditionStack[this.conditionStack.length-1]?this.conditions[this.conditionStack[this.conditionStack.length-1]].rules:this.conditions.INITIAL.rules},topState:function(t){return t=this.conditionStack.length-1-Math.abs(t||0),t>=0?this.conditionStack[t]:"INITIAL"},pushState:function(t){this.begin(t)},stateStackSize:function(){return this.conditionStack.length},options:{},performAction:function(t,n,r,i){var s=i;switch(r){case 0:break;case 1:break;case 2:break;case 3:return 25;case 4:return"INVALID";case 5:return 28;case 6:return 20;case 7:return 23;case 8:return 24;case 9:return"for";case 10:return"case";case 11:return"default";case 12:return 51;case 13:return"break";case 14:return"continue";case 15:return 29;case 16:return 39;case 17:return 30;case 18:return 8;case 19:return 9;case 20:return 16;case 21:return 63;case 22:return 58;case 23:return 59;case 24:return 60;case 25:return 45;case 26:return 46;case 27:return 47;case 28:this.begin("DoubleQuotedString"),this.string="";break;case 29:this.begin("SingleQuotedString"),this.string="";break;case 30:this.begin("QuotedStringEscape");break;case 31:return n.yytext=this.string,this.string=undefined,this.popState(),55;case 32:return n.yytext=this.string,this.string=undefined,this.popState(),55;case 33:switch(n.yytext){case"\r\n":case"\n":break;case"b":this.string+="\b";break;case"n":this.string+="\n";break;case"r":this.string+="\r";break;case"t":this.string+="	";break;case"'":this.string+="'";break;case'"':this.string+='"';break;case"\\":this.string+="\\";break;default:this.string+="\\"+$1}this.popState();break;case 34:this.string+=n.yytext;break;case 35:this.string+=n.yytext;break;case 36:return 66;case 37:return 56;case 38:return 57;case 39:return 31;case 40:return 32;case 41:return 33;case 42:return 34;case 43:return 35;case 44:return 40;case 45:return 44;case 46:return 43;case 47:return 42;case 48:return 41;case 49:return 36;case 50:return 37;case 51:return 38;case 52:return 21;case 53:return 22;case 54:return 53;case 55:return 54;case 56:return 5;case 57:return"INVALID"}},rules:[/^(?:\/\/([^\n\r]*))/,/^(?:\/\*([\u0000-\uffff]*?)\*\/)/,/^(?:\s+)/,/^(?:function\b)/,/^(?:return\s*\n)/,/^(?:return\b)/,/^(?:if\b)/,/^(?:else\b)/,/^(?:while\b)/,/^(?:for\b)/,/^(?:case\b)/,/^(?:default\b)/,/^(?:new\b)/,/^(?:break\b)/,/^(?:continue\b)/,/^(?:var\b)/,/^(?:===)/,/^(?:=)/,/^(?:\{)/,/^(?:\})/,/^(?:;)/,/^(?:,)/,/^(?:true\b)/,/^(?:false\b)/,/^(?:\[\])/,/^(?:\[)/,/^(?:\])/,/^(?:\.)/,/^(?:")/,/^(?:')/,/^(?:\\)/,/^(?:")/,/^(?:')/,/^(?:(.|\r\n|\n))/,/^(?:[^"\\]*)/,/^(?:[^'\\]*)/,/^(?:[A-Za-z_][A-Za-z0-9_]*)/,/^(?:[0-9]+(\.[0-9]+)?([eE][\-+]?[0-9]+)?\b)/,/^(?:[0-9]+\b)/,/^(?:\+)/,/^(?:-)/,/^(?:\*)/,/^(?:\/)/,/^(?:%)/,/^(?:!==)/,/^(?:<=)/,/^(?:>=)/,/^(?:<)/,/^(?:>)/,/^(?:!)/,/^(?:&&)/,/^(?:\|\|)/,/^(?:\()/,/^(?:\))/,/^(?:\?)/,/^(?::)/,/^(?:$)/,/^(?:.)/],conditions:{QuotedStringEscape:{rules:[33],inclusive:!1},SingleQuotedString:{rules:[30,32,35],inclusive:!1},DoubleQuotedString:{rules:[30,31,34],inclusive:!1},INITIAL:{rules:[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57],inclusive:!0}}};return e}();return nt.lexer=it,nt.lexer.options.ranges=!0,nt}),n("lib/parser/parser-week-10.js",["require","lib/parser/nodes"],function(e){var t=function(e,t,n,r){for(n=n||{},r=e.length;r--;n[e[r]]=t);return n},n=[1,15],r=[1,16],i=[1,24],s=[1,17],o=[1,18],u=[1,19],a=[1,20],f=[1,22],l=[1,21],c=[1,23],h=[1,38],p=[1,29],d=[1,31],v=[1,32],m=[1,33],g=[1,34],y=[1,35],b=[1,36],w=[1,37],E=[16,30,31,32,33,34,35,37,38,39,40,41,42,43,44,45,47,54],S=[2,68],x=[1,47],T=[1,43],N=[5,9],C=[5,8,9,16,20,21,24,25,28,29,31,32,36,45,52,56,57,58,59,60,61,67],k=[1,55],L=[1,56],A=[1,57],O=[1,58],M=[1,59],_=[1,60],D=[1,61],P=[1,62],H=[1,63],B=[1,64],j=[1,65],F=[1,66],I=[1,67],q=[1,68],R=[1,69],U=[1,70],z=[1,74],W=[1,76],X=[9,16,22,30,31,32,33,34,35,37,38,39,40,41,42,43,44,45,46,47,54,55,64],V=[2,51],$=[1,82],J=[2,75],K=[5,8,9,16,20,21,22,23,24,25,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,52,54,55,56,57,58,59,60,61,64,67],Q=[1,90],G=[2,79],Y=[9,16,22,30,31,32,33,34,35,37,38,39,40,41,42,43,44,46,54,55,64],Z=[22,46],et=[9,16,22,30,31,32,37,38,39,40,41,42,43,44,46,54,55,64],tt=[9,16,22,30,37,38,39,40,46,54,55,64],nt=[9,16,22,30,37,38,39,40,41,42,43,44,46,54,55,64],rt=[1,140],it={trace:function(){},yy:{},symbols_:{error:2,program:3,statements:4,EOF:5,statement_block:6,empty_block:7,"{":8,"}":9,non_empty_statements:10,statement:11,if_statement:12,while_statement:13,function_definition:14,return_statement:15,";":16,variable_definition:17,assignment_statement:18,expression:19,"if":20,"(":21,")":22,"else":23,"while":24,"function":25,identifier:26,identifiers:27,"return":28,"var":29,"=":30,"+":31,"-":32,"*":33,"/":34,"%":35,"!":36,"&&":37,"||":38,"===":39,"!==":40,">":41,"<":42,">=":43,"<=":44,"[":45,"]":46,".":47,constants:48,expressions:49,array_literal:50,object_literal:51,"new":52,function_expression:53,"?":54,":":55,STRING:56,FLOAT_NUMBER:57,INT_NUMBER:58,"true":59,"false":60,empty_list:61,non_empty_object_literal_statements:62,object_literal_statement:63,",":64,non_empty_expressions:65,non_empty_identifiers:66,Identifier:67,$accept:0,$end:1},terminals_:{2:"error",5:"EOF",8:"{",9:"}",16:";",20:"if",21:"(",22:")",23:"else",24:"while",25:"function",28:"return",29:"var",30:"=",31:"+",32:"-",33:"*",34:"/",35:"%",36:"!",37:"&&",38:"||",39:"===",40:"!==",41:">",42:"<",43:">=",44:"<=",45:"[",46:"]",47:".",52:"new",54:"?",55:":",56:"STRING",57:"FLOAT_NUMBER",58:"INT_NUMBER",59:"true",60:"false",61:"empty_list",64:",",67:"Identifier"},productions_:[0,[3,2],[3,2],[3,2],[7,2],[6,3],[4,0],[4,1],[10,2],[10,1],[11,1],[11,1],[11,1],[11,2],[11,2],[11,2],[11,2],[11,1],[12,7],[12,7],[12,7],[12,7],[12,7],[12,7],[13,5],[13,5],[14,6],[14,6],[15,2],[17,4],[18,3],[19,3],[19,3],[19,3],[19,3],[19,3],[19,2],[19,2],[19,2],[19,3],[19,3],[19,3],[19,3],[19,3],[19,3],[19,3],[19,3],[19,4],[19,3],[19,3],[19,1],[19,1],[19,6],[19,1],[19,1],[19,4],[19,6],[19,5],[19,1],[19,5],[48,1],[48,1],[48,1],[48,1],[48,1],[48,1],[50,3],[51,3],[51,1],[62,3],[62,1],[63,3],[53,5],[53,5],[49,1],[49,0],[65,3],[65,1],[27,1],[27,0],[66,3],[66,1],[26,1]],performAction:function(t,n,r,i,s,o,u){var a=o.length-1;switch(s){case 1:case 2:case 3:return o[a-1];case 4:this.$=[];break;case 5:case 49:this.$=o[a-1];break;case 6:case 75:case 79:this.$=[];break;case 8:o[a-1]===st.no_op()?this.$=o[a]:this.$=st.pair(o[a-1],o[a]);break;case 9:o[a]===st.no_op()?this.$=[]:this.$=st.pair(o[a],[]);break;case 17:this.$=st.no_op();break;case 18:case 19:case 20:case 21:this.$=st.if_statement(o[a-4],o[a-2],o[a],r);break;case 22:case 23:this.$=st.if_statement(o[a-4],o[a-2],st.pair(o[a],[]),r);break;case 24:case 25:this.$=st.while_statement(o[a-2],o[a],r);break;case 26:case 27:this.$=st.variable_definition(o[a-4],st.function_definition(o[a-4],o[a-2],o[a],u[a-5],u[a]),r);break;case 28:this.$=st.return_statement(o[a],r);break;case 29:this.$=st.variable_definition(o[a-2],o[a],r);break;case 30:o[a-2].tag==="variable"?this.$=st.assignment(o[a-2],o[a],r):o[a-2].tag==="property_access"?this.$=st.property_assignment(o[a-2].object,o[a-2].property,o[a],r):error("parse error in line "+r+": "+t);break;case 31:case 32:case 33:case 34:case 35:case 41:case 42:case 43:case 44:case 45:case 46:this.$=st.eager_binary_expression(o[a-2],o[a-1],o[a],r);break;case 36:case 37:this.$=st.eager_binary_expression(0,o[a-1],o[a],r);break;case 38:this.$=st.eager_unary_expression(o[a-1],o[a],r);break;case 39:case 40:this.$=st.boolean_operation(o[a-2],o[a-1],o[a],r);break;case 47:this.$=st.property_access(o[a-3],o[a-1],r);break;case 48:this.$=st.property_access(o[a-2],o[a],r);break;case 51:this.$=st.variable(o[a],r);break;case 52:this.$=st.application(o[a-4],o[a-1],r);break;case 55:this.$=st.application(st.variable(o[a-3],r),o[a-1],r);break;case 56:this.$=st.object_method_application(o[a-5],o[a-3],o[a-1],r);break;case 57:this.$=st.construction(o[a-3],o[a-1],r);break;case 59:this.$=st.ternary(o[a-4],o[a-2],o[a],r);break;case 60:case 82:this.$=t;break;case 61:this.$=parseFloat(t);break;case 62:this.$=parseInt(t,10);break;case 63:this.$=!0;break;case 64:this.$=!1;break;case 65:this.$=st.empty_list(r);break;case 66:this.$=st.array_literal(o[a-1],r);break;case 67:this.$=st.object_literal(o[a-1],r);break;case 68:this.$=st.object_literal([],r);break;case 69:case 71:case 76:case 80:this.$=st.pair(o[a-2],o[a]);break;case 70:case 77:case 81:this.$=st.pair(o[a],[]);break;case 72:case 73:this.$=st.function_definition("lambda",o[a-2],o[a],u[a-4],u[a]);break;case 74:case 78:this.$=o[a]}},table:[{3:1,4:2,5:[2,6],6:3,7:4,8:[1,6],10:5,11:7,12:8,13:9,14:10,15:11,16:n,17:12,18:13,19:14,20:r,21:i,24:s,25:o,26:26,28:u,29:a,31:f,32:l,36:c,45:h,48:25,50:27,51:28,52:p,53:30,56:d,57:v,58:m,59:g,60:y,61:b,67:w},{1:[3]},{5:[1,39]},{5:[1,40]},t(E,S,{5:[1,41]}),{5:[2,7]},{7:48,8:x,9:T,10:42,11:7,12:8,13:9,14:10,15:11,16:n,17:12,18:13,19:14,20:r,21:i,24:s,25:o,26:46,28:u,29:a,31:f,32:l,36:c,45:h,48:25,50:27,51:28,52:p,53:30,56:d,57:v,58:m,59:g,60:y,61:b,62:44,63:45,67:w},t(N,[2,9],{11:7,12:8,13:9,14:10,15:11,17:12,18:13,19:14,48:25,26:26,50:27,51:28,53:30,7:48,10:49,8:x,16:n,20:r,21:i,24:s,25:o,28:u,29:a,31:f,32:l,36:c,45:h,52:p,56:d,57:v,58:m,59:g,60:y,61:b,67:w}),t(C,[2,10]),t(C,[2,11]),t(C,[2,12]),{16:[1,50]},{16:[1,51]},{16:[1,52]},{16:[1,53],30:[1,54],31:k,32:L,33:A,34:O,35:M,37:_,38:D,39:P,40:H,41:B,42:j,43:F,44:I,45:q,47:R,54:U},t(C,[2,17]),{21:[1,71]},{21:[1,72]},{21:z,26:73,67:w},{7:48,8:x,19:75,21:i,25:W,26:26,31:f,32:l,36:c,45:h,48:25,50:27,51:28,52:p,53:30,56:d,57:v,58:m,59:g,60:y,61:b,67:w},{26:77,67:w},{7:48,8:x,19:78,21:i,25:W,26:26,31:f,32:l,36:c,45:h,48:25,50:27,51:28,52:p,53:30,56:d,57:v,58:m,59:g,60:y,61:b,67:w},{7:48,8:x,19:79,21:i,25:W,26:26,31:f,32:l,36:c,45:h,48:25,50:27,51:28,52:p,53:30,56:d,57:v,58:m,59:g,60:y,61:b,67:w},{7:48,8:x,19:80,21:i,25:W,26:26,31:f,32:l,36:c,45:h,48:25,50:27,51:28,52:p,53:30,56:d,57:v,58:m,59:g,60:y,61:b,67:w},{7:48,8:x,19:81,21:i,25:W,26:26,31:f,32:l,36:c,45:h,48:25,50:27,51:28,52:p,53:30,56:d,57:v,58:m,59:g,60:y,61:b,67:w},t(X,[2,50]),t(X,V,{21:$}),t(X,[2,53]),t(X,[2,54]),{26:83,67:w},t(X,[2,58]),t(X,[2,60]),t(X,[2,61]),t(X,[2,62]),t(X,[2,63]),t(X,[2,64]),t(X,[2,65]),t([9,16,21,22,30,31,32,33,34,35,37,38,39,40,41,42,43,44,45,46,47,54,55,64],[2,82]),{7:48,8:x,19:86,21:i,25:W,26:26,31:f,32:l,36:c,45:h,46:J,48:25,49:84,50:27,51:28,52:p,53:30,56:d,57:v,58:m,59:g,60:y,61:b,65:85,67:w},{1:[2,1]},{1:[2,2]},{1:[2,3]},{9:[1,87]},t(K,[2,4]),{9:[1,88]},{9:[2,70],64:[1,89]},t(E,V,{21:$,55:Q}),{9:T,26:91,62:44,63:45,67:w},t(X,S),t(N,[2,8]),t(C,[2,13]),t(C,[2,14]),t(C,[2,15]),t(C,[2,16]),{7:48,8:x,19:92,21:i,25:W,26:26,31:f,32:l,36:c,45:h,48:25,50:27,51:28,52:p,53:30,56:d,57:v,58:m,59:g,60:y,61:b,67:w},{7:48,8:x,19:93,21:i,25:W,26:26,31:f,32:l,36:c,45:h,48:25,50:27,51:28,52:p,53:30,56:d,57:v,58:m,59:g,60:y,61:b,67:w},{7:48,8:x,19:94,21:i,25:W,26:26,31:f,32:l,36:c,45:h,48:25,50:27,51:28,52:p,53:30,56:d,57:v,58:m,59:g,60:y,61:b,67:w},{7:48,8:x,19:95,21:i,25:W,26:26,31:f,32:l,36:c,45:h,48:25,50:27,51:28,52:p,53:30,56:d,57:v,58:m,59:g,60:y,61:b,67:w},{7:48,8:x,19:96,21:i,25:W,26:26,31:f,32:l,36:c,45:h,48:25,50:27,51:28,52:p,53:30,56:d,57:v,58:m,59:g,60:y,61:b,67:w},{7:48,8:x,19:97,21:i,25:W,26:26,31:f,32:l,36:c,45:h,48:25,50:27,51:28,52:p,53:30,56:d,57:v,58:m,59:g,60:y,61:b,67:w},{7:48,8:x,19:98,21:i,25:W,26:26,31:f,32:l,36:c,45:h,48:25,50:27,51:28,52:p,53:30,56:d,57:v,58:m,59:g,60:y,61:b,67:w},{7:48,8:x,19:99,21:i,25:W,26:26,31:f,32:l,36:c,45:h,48:25,50:27,51:28,52:p,53:30,56:d,57:v,58:m,59:g,60:y,61:b,67:w},{7:48,8:x,19:100,21:i,25:W,26:26,31:f,32:l,36:c,45:h,48:25,50:27,51:28,52:p,53:30,56:d,57:v,58:m,59:g,60:y,61:b,67:w},{7:48,8:x,19:101,21:i,25:W,26:26,31:f,32:l,36:c,45:h,48:25,50:27,51:28,52:p,53:30,56:d,57:v,58:m,59:g,60:y,61:b,67:w},{7:48,8:x,19:102,21:i,25:W,26:26,31:f,32:l,36:c,45:h,48:25,50:27,51:28,52:p,53:30,56:d,57:v,58:m,59:g,60:y,61:b,67:w},{7:48,8:x,19:103,21:i,25:W,26:26,31:f,32:l,36:c,45:h,48:25,50:27,51:28,52:p,53:30,56:d,57:v,58:m,59:g,60:y,61:b,67:w},{7:48,8:x,19:104,21:i,25:W,26:26,31:f,32:l,36:c,45:h,48:25,50:27,51:28,52:p,53:30,56:d,57:v,58:m,59:g,60:y,61:b,67:w},{7:48,8:x,19:105,21:i,25:W,26:26,31:f,32:l,36:c,45:h,48:25,50:27,51:28,52:p,53:30,56:d,57:v,58:m,59:g,60:y,61:b,67:w},{7:48,8:x,19:106,21:i,25:W,26:26,31:f,32:l,36:c,45:h,48:25,50:27,51:28,52:p,53:30,56:d,57:v,58:m,59:g,60:y,61:b,67:w},{26:107,67:w},{7:48,8:x,19:108,21:i,25:W,26:26,31:f,32:l,36:c,45:h,48:25,50:27,51:28,52:p,53:30,56:d,57:v,58:m,59:g,60:y,61:b,67:w},{7:48,8:x,19:109,21:i,25:W,26:26,31:f,32:l,36:c,45:h,48:25,50:27,51:28,52:p,53:30,56:d,57:v,58:m,59:g,60:y,61:b,67:w},{7:48,8:x,19:110,21:i,25:W,26:26,31:f,32:l,36:c,45:h,48:25,50:27,51:28,52:p,53:30,56:d,57:v,58:m,59:g,60:y,61:b,67:w},{21:[1,111]},{22:G,26:114,27:112,66:113,67:w},{16:[2,28],31:k,32:L,33:A,34:O,35:M,37:_,38:D,39:P,40:H,41:B,42:j,43:F,44:I,45:q,47:R,54:U},{21:z},{30:[1,115]},t(Y,[2,36],{45:q,47:R}),t(Y,[2,37],{45:q,47:R}),t(Y,[2,38],{45:q,47:R}),{22:[1,116],31:k,32:L,33:A,34:O,35:M,37:_,38:D,39:P,40:H,41:B,42:j,43:F,44:I,45:q,47:R,54:U},{7:48,8:x,19:86,21:i,22:J,25:W,26:26,31:f,32:l,36:c,45:h,48:25,49:117,50:27,51:28,52:p,53:30,56:d,57:v,58:m,59:g,60:y,61:b,65:85,67:w},{21:[1,118]},{46:[1,119]},t(Z,[2,74]),t(Z,[2,77],{31:k,32:L,33:A,34:O,35:M,37:_,38:D,39:P,40:H,41:B,42:j,43:F,44:I,45:q,47:R,54:U,64:[1,120]}),t(K,[2,5]),t(X,[2,67]),{26:91,62:121,63:45,67:w},{7:48,8:x,19:122,21:i,25:W,26:26,31:f,32:l,36:c,45:h,48:25,50:27,51:28,52:p,53:30,56:d,57:v,58:m,59:g,60:y,61:b,67:w},{55:Q},{16:[2,30],31:k,32:L,33:A,34:O,35:M,37:_,38:D,39:P,40:H,41:B,42:j,43:F,44:I,45:q,47:R,54:U},t(et,[2,31],{33:A,34:O,35:M,45:q,47:R}),t(et,[2,32],{33:A,34:O,35:M,45:q,47:R}),t(Y,[2,33],{45:q,47:R}),t(Y,[2,34],{45:q,47:R}),t(Y,[2,35],{45:q,47:R}),t([9,16,22,30,37,38,46,54,55,64],[2,39],{31:k,32:L,33:A,34:O,35:M,39:P,40:H,41:B,42:j,43:F,44:I,45:q,47:R}),t([9,16,22,30,38,46,54,55,64],[2,40],{31:k,32:L,33:A,34:O,35:M,37:_,39:P,40:H,41:B,42:j,43:F,44:I,45:q,47:R}),t(tt,[2,41],{31:k,32:L,33:A,34:O,35:M,41:B,42:j,43:F,44:I,45:q,47:R}),t(tt,[2,42],{31:k,32:L,33:A,34:O,35:M,41:B,42:j,43:F,44:I,45:q,47:R}),t(nt,[2,43],{31:k,32:L,33:A,34:O,35:M,45:q,47:R}),t(nt,[2,44],{31:k,32:L,33:A,34:O,35:M,45:q,47:R}),t(nt,[2,45],{31:k,32:L,33:A,34:O,35:M,45:q,47:R}),t(nt,[2,46],{31:k,32:L,33:A,34:O,35:M,45:q,47:R}),{31:k,32:L,33:A,34:O,35:M,37:_,38:D,39:P,40:H,41:B,42:j,43:F,44:I,45:q,46:[1,123],47:R,54:U},t(X,[2,48],{21:[1,124]}),{31:k,32:L,33:A,34:O,35:M,37:_,38:D,39:P,40:H,41:B,42:j,43:F,44:I,45:q,47:R,54:U,55:[1,125]},{22:[1,126],31:k,32:L,33:A,34:O,35:M,37:_,38:D,39:P,40:H,41:B,42:j,43:F,44:I,45:q,47:R,54:U},{22:[1,127],31:k,32:L,33:A,34:O,35:M,37:_,38:D,39:P,40:H,41:B,42:j,43:F,44:I,45:q,47:R,54:U},{22:G,26:114,27:128,66:113,67:w},{22:[1,129]},{22:[2,78]},{22:[2,81],64:[1,130]},{7:48,8:x,19:131,21:i,25:W,26:26,31:f,32:l,36:c,45:h,48:25,50:27,51:28,52:p,53:30,56:d,57:v,58:m,59:g,60:y,61:b,67:w},t(X,[2,49],{21:[1,132]}),{22:[1,133]},{7:48,8:x,19:86,21:i,22:J,25:W,26:26,31:f,32:l,36:c,45:h,48:25,49:134,50:27,51:28,52:p,53:30,56:d,57:v,58:m,59:g,60:y,61:b,65:85,67:w},t(X,[2,66]),{7:48,8:x,19:86,21:i,25:W,26:26,31:f,32:l,36:c,45:h,48:25,50:27,51:28,52:p,53:30,56:d,57:v,58:m,59:g,60:y,61:b,65:135,67:w},{9:[2,69]},t([9,64],[2,71],{31:k,32:L,33:A,34:O,35:M,37:_,38:D,39:P,40:H,41:B,42:j,43:F,44:I,45:q,47:R,54:U}),t(X,[2,47]),{7:48,8:x,19:86,21:i,22:J,25:W,26:26,31:f,32:l,36:c,45:h,48:25,49:136,50:27,51:28,52:p,53:30,56:d,57:v,58:m,59:g,60:y,61:b,65:85,67:w},{7:48,8:x,19:137,21:i,25:W,26:26,31:f,32:l,36:c,45:h,48:25,50:27,51:28,52:p,53:30,56:d,57:v,58:m,59:g,60:y,61:b,67:w},{6:138,7:139,8:rt},{6:141,7:142,8:rt},{22:[1,143]},{6:144,7:145,8:rt},{26:114,66:146,67:w},{16:[2,29],31:k,32:L,33:A,34:O,35:M,37:_,38:D,39:P,40:H,41:B,42:j,43:F,44:I,45:q,47:R,54:U},{7:48,8:x,19:86,21:i,22:J,25:W,26:26,31:f,32:l,36:c,45:h,48:25,49:147,50:27,51:28,52:p,53:30,56:d,57:v,58:m,59:g,60:y,61:b,65:85,67:w},t(X,[2,55]),{22:[1,148]},t(Z,[2,76]),{22:[1,149]},t([9,16,22,30,46,55,64],[2,59],{31:k,32:L,33:A,34:O,35:M,37:_,38:D,39:P,40:H,41:B,42:j,43:F,44:I,45:q,47:R,54:U}),{23:[1,150]},{23:[1,151]},{7:48,8:x,9:T,10:42,11:7,12:8,13:9,14:10,15:11,16:n,17:12,18:13,19:14,20:r,21:i,24:s,25:o,26:26,28:u,29:a,31:f,32:l,36:c,45:h,48:25,50:27,51:28,52:p,53:30,56:d,57:v,58:m,59:g,60:y,61:b,67:w},t(C,[2,24]),t(C,[2,25]),{6:152,7:153,8:rt},t(X,[2,72]),t(X,[2,73]),{22:[2,80]},{22:[1,154]},t(X,[2,57]),t(X,[2,56]),{6:155,7:156,8:rt,12:157,20:r},{6:158,7:159,8:rt,12:160,20:r},t(C,[2,26]),t(C,[2,27]),t(X,[2,52]),t(C,[2,18]),t(C,[2,19]),t(C,[2,22]),t(C,[2,20]),t(C,[2,21]),t(C,[2,23])],defaultActions:{5:[2,7],39:[2,1],40:[2,2],41:[2,3],113:[2,78],121:[2,69],146:[2,80]},parseError:function(t,n){if(!n.recoverable){function r(e,t){this.message=e,this.hash=t}throw r.prototype=new Error,new r(t,n)}this.trace(t)},parse:function(t){function w(e){r.length=r.length-2*e,s.length=s.length-e,o.length=o.length-e}var n=this,r=[0],i=[],s=[null],o=[],u=this.table,a="",f=0,l=0,c=0,h=2,p=1,d=o.slice.call(arguments,1),v=Object.create(this.lexer),m={yy:{}};for(var g in this.yy)Object.prototype.hasOwnProperty.call(this.yy,g)&&(m.yy[g]=this.yy[g]);v.setInput(t,m.yy),m.yy.lexer=v,m.yy.parser=this,typeof v.yylloc=="undefined"&&(v.yylloc={});var y=v.yylloc;o.push(y);var b=v.options&&v.options.ranges;typeof m.yy.parseError=="function"?this.parseError=m.yy.parseError:this.parseError=Object.getPrototypeOf(this).parseError;function E(){var e;return e=v.lex()||p,typeof e!="number"&&(e=n.symbols_[e]||e),e}var S,x,T,N,C,k,L={},A,O,M,_;for(;;){T=r[r.length-1];if(this.defaultActions[T])N=this.defaultActions[T];else{if(S===null||typeof S=="undefined")S=E();N=u[T]&&u[T][S]}if(typeof N=="undefined"||!N.length||!N[0]){var D="";_=[];for(A in u[T])this.terminals_[A]&&A>h&&_.push("'"+this.terminals_[A]+"'");v.showPosition?D="Parse error on line "+(f+1)+":\n"+v.showPosition()+"\nExpecting "+_.join(", ")+", got '"+(this.terminals_[S]||S)+"'":D="Parse error on line "+(f+1)+": Unexpected "+(S==p?"end of input":"'"+(this.terminals_[S]||S)+"'"),this.parseError(D,{text:v.match,token:this.terminals_[S]||S,line:v.yylineno,loc:y,expected:_})}if(N[0]instanceof Array&&N.length>1)throw new Error("Parse Error: multiple actions possible at state: "+T+", token: "+S);switch(N[0]){case 1:r.push(S),s.push(v.yytext),o.push(v.yylloc),r.push(N[1]),S=null,x?(S=x,x=null):(l=v.yyleng,a=v.yytext,f=v.yylineno,y=v.yylloc,c>0&&c--);break;case 2:O=this.productions_[N[1]][1],L.$=s[s.length-O],L._$={first_line:o[o.length-(O||1)].first_line,last_line:o[o.length-1].last_line,first_column:o[o.length-(O||1)].first_column,last_column:o[o.length-1].last_column},b&&(L._$.range=[o[o.length-(O||1)].range[0],o[o.length-1].range[1]]),k=this.performAction.apply(L,[a,l,f,m.yy,N[1],s,o].concat(d));if(typeof k!="undefined")return k;O&&(r=r.slice(0,-1*O*2),s=s.slice(0,-1*O),o=o.slice(0,-1*O)),r.push(this.productions_[N[1]][0]),s.push(L.$),o.push(L._$),M=u[r[r.length-2]][r[r.length-1]],r.push(M);break;case 3:return!0}}return!0}},st=e("lib/parser/nodes"),ot=function(){var e={EOF:1,parseError:function(t,n){if(!this.yy.parser)throw new Error(t);this.yy.parser.parseError(t,n)},setInput:function(e,t){return this.yy=t||this.yy||{},this._input=e,this._more=this._backtrack=this.done=!1,this.yylineno=this.yyleng=0,this.yytext=this.matched=this.match="",this.conditionStack=["INITIAL"],this.yylloc={first_line:1,first_column:0,last_line:1,last_column:0},this.options.ranges&&(this.yylloc.range=[0,0]),this.offset=0,this},input:function(){var e=this._input[0];this.yytext+=e,this.yyleng++,this.offset++,this.match+=e,this.matched+=e;var t=e.match(/(?:\r\n?|\n).*/g);return t?(this.yylineno++,this.yylloc.last_line++):this.yylloc.last_column++,this.options.ranges&&this.yylloc.range[1]++,this._input=this._input.slice(1),e},unput:function(e){var t=e.length,n=e.split(/(?:\r\n?|\n)/g);this._input=e+this._input,this.yytext=this.yytext.substr(0,this.yytext.length-t),this.offset-=t;var r=this.match.split(/(?:\r\n?|\n)/g);this.match=this.match.substr(0,this.match.length-1),this.matched=this.matched.substr(0,this.matched.length-1),n.length-1&&(this.yylineno-=n.length-1);var i=this.yylloc.range;return this.yylloc={first_line:this.yylloc.first_line,last_line:this.yylineno+1,first_column:this.yylloc.first_column,last_column:n?(n.length===r.length?this.yylloc.first_column:0)+r[r.length-n.length].length-n[0].length:this.yylloc.first_column-t},this.options.ranges&&(this.yylloc.range=[i[0],i[0]+this.yyleng-t]),this.yyleng=this.yytext.length,this},more:function(){return this._more=!0,this},reject:function(){return this.options.backtrack_lexer?(this._backtrack=!0,this):this.parseError("Lexical error on line "+(this.yylineno+1)+". You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).\n"+this.showPosition(),{text:"",token:null,line:this.yylineno})},less:function(e){this.unput(this.match.slice(e))},pastInput:function(){var e=this.matched.substr(0,this.matched.length-this.match.length);return(e.length>20?"...":"")+e.substr(-20).replace(/\n/g,"")},upcomingInput:function(){var e=this.match;return e.length<20&&(e+=this._input.substr(0,20-e.length)),(e.substr(0,20)+(e.length>20?"...":"")).replace(/\n/g,"")},showPosition:function(){var e=this.pastInput(),t=(new Array(e.length+1)).join("-");return e+this.upcomingInput()+"\n"+t+"^"},test_match:function(e,t){var n,r,i;this.options.backtrack_lexer&&(i={yylineno:this.yylineno,yylloc:{first_line:this.yylloc.first_line,last_line:this.last_line,first_column:this.yylloc.first_column,last_column:this.yylloc.last_column},yytext:this.yytext,match:this.match,matches:this.matches,matched:this.matched,yyleng:this.yyleng,offset:this.offset,_more:this._more,_input:this._input,yy:this.yy,conditionStack:this.conditionStack.slice(0),done:this.done},this.options.ranges&&(i.yylloc.range=this.yylloc.range.slice(0))),r=e[0].match(/(?:\r\n?|\n).*/g),r&&(this.yylineno+=r.length),this.yylloc={first_line:this.yylloc.last_line,last_line:this.yylineno+1,first_column:this.yylloc.last_column,last_column:r?r[r.length-1].length-r[r.length-1].match(/\r?\n?/)[0].length:this.yylloc.last_column+e[0].length},this.yytext+=e[0],this.match+=e[0],this.matches=e,this.yyleng=this.yytext.length,this.options.ranges&&(this.yylloc.range=[this.offset,this.offset+=this.yyleng]),this._more=!1,this._backtrack=!1,this._input=this._input.slice(e[0].length),this.matched+=e[0],n=this.performAction.call(this,this.yy,this,t,this.conditionStack[this.conditionStack.length-1]),this.done&&this._input&&(this.done=!1);if(n)return n;if(this._backtrack){for(var s in i)this[s]=i[s];return!1}return!1},next:function(){if(this.done)return this.EOF;this._input||(this.done=!0);var e,t,n,r;this._more||(this.yytext="",this.match="");var i=this._currentRules();for(var s=0;s<i.length;s++){n=this._input.match(this.rules[i[s]]);if(n&&(!t||n[0].length>t[0].length)){t=n,r=s;if(this.options.backtrack_lexer){e=this.test_match(n,i[s]);if(e!==!1)return e;if(this._backtrack){t=!1;continue}return!1}if(!this.options.flex)break}}return t?(e=this.test_match(t,i[r]),e!==!1?e:!1):this._input===""?this.EOF:this.parseError("Lexical error on line "+(this.yylineno+1)+". Unrecognized text.\n"+this.showPosition(),{text:"",token:null,line:this.yylineno})},lex:function(){var t=this.next();return t?t:this.lex()},begin:function(t){this.conditionStack.push(t)},popState:function(){var t=this.conditionStack.length-1;return t>0?this.conditionStack.pop():this.conditionStack[0]},_currentRules:function(){return this.conditionStack.length&&this.conditionStack[this.conditionStack.length-1]?this.conditions[this.conditionStack[this.conditionStack.length-1]].rules:this.conditions.INITIAL.rules},topState:function(t){return t=this.conditionStack.length-1-Math.abs(t||0),t>=0?this.conditionStack[t]:"INITIAL"},pushState:function(t){this.begin(t)},stateStackSize:function(){return this.conditionStack.length},options:{},performAction:function(t,n,r,i){var s=i;switch(r){case 0:break;case 1:break;case 2:break;case 3:return 25;case 4:return"INVALID";case 5:return 28;case 6:return 20;case 7:return 23;case 8:return 24;case 9:return"for";case 10:return"case";case 11:return"default";case 12:return 52;case 13:return"break";case 14:return"continue";case 15:return 29;case 16:return 39;case 17:return 30;case 18:return 8;case 19:return 9;case 20:return 16;case 21:return 64;case 22:return 59;case 23:return 60;case 24:return 61;case 25:return 45;case 26:return 46;case 27:return 47;case 28:this.begin("DoubleQuotedString"),this.string="";break;case 29:this.begin("SingleQuotedString"),this.string="";break;case 30:this.begin("QuotedStringEscape");break;case 31:return n.yytext=this.string,this.string=undefined,this.popState(),56;case 32:return n.yytext=this.string,this.string=undefined,this.popState(),56;case 33:switch(n.yytext){case"\r\n":case"\n":break;case"b":this.string+="\b";break;case"n":this.string+="\n";break;case"r":this.string+="\r";break;case"t":this.string+="	";break;case"'":this.string+="'";break;case'"':this.string+='"';break;case"\\":this.string+="\\";break;default:this.string+="\\"+$1}this.popState();break;case 34:this.string+=n.yytext;break;case 35:this.string+=n.yytext;break;case 36:return 67;case 37:return 57;case 38:return 58;case 39:return 31;case 40:return 32;case 41:return 33;case 42:return 34;case 43:return 35;case 44:return 40;case 45:return 44;case 46:return 43;case 47:return 42;case 48:return 41;case 49:return 36;case 50:return 37;case 51:return 38;case 52:return 21;case 53:return 22;case 54:return 54;case 55:return 55;case 56:return 5;case 57:return"INVALID"}},rules:[/^(?:\/\/([^\n\r]*))/,/^(?:\/\*([\u0000-\uffff]*?)\*\/)/,/^(?:\s+)/,/^(?:function\b)/,/^(?:return\s*\n)/,/^(?:return\b)/,/^(?:if\b)/,/^(?:else\b)/,/^(?:while\b)/,/^(?:for\b)/,/^(?:case\b)/,/^(?:default\b)/,/^(?:new\b)/,/^(?:break\b)/,/^(?:continue\b)/,/^(?:var\b)/,/^(?:===)/,/^(?:=)/,/^(?:\{)/,/^(?:\})/,/^(?:;)/,/^(?:,)/,/^(?:true\b)/,/^(?:false\b)/,/^(?:\[\])/,/^(?:\[)/,/^(?:\])/,/^(?:\.)/,/^(?:")/,/^(?:')/,/^(?:\\)/,/^(?:")/,/^(?:')/,/^(?:(.|\r\n|\n))/,/^(?:[^"\\]*)/,/^(?:[^'\\]*)/,/^(?:[A-Za-z_][A-Za-z0-9_]*)/,/^(?:[0-9]+(\.[0-9]+)?([eE][\-+]?[0-9]+)?\b)/,/^(?:[0-9]+\b)/,/^(?:\+)/,/^(?:-)/,/^(?:\*)/,/^(?:\/)/,/^(?:%)/,/^(?:!==)/,/^(?:<=)/,/^(?:>=)/,/^(?:<)/,/^(?:>)/,/^(?:!)/,/^(?:&&)/,/^(?:\|\|)/,/^(?:\()/,/^(?:\))/,/^(?:\?)/,/^(?::)/,/^(?:$)/,/^(?:.)/],conditions:{QuotedStringEscape:{rules:[33],inclusive:!1},SingleQuotedString:{rules:[30,32,35],inclusive:!1},DoubleQuotedString:{rules:[30,31,34],inclusive:!1},INITIAL:{rules:[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57],inclusive:!0}}};return e}();return it.lexer=ot,it.lexer.options.ranges=!0,it}),n("lib/parser/parser-week-12.js",["require","lib/parser/nodes"],function(e){var t=function(e,t,n,r){for(n=n||{},r=e.length;r--;n[e[r]]=t);return n},n=[1,18],r=[1,19],i=[1,30],s=[1,20],o=[1,21],u=[1,22],a=[1,23],f=[1,24],l=[1,25],c=[1,26],h=[1,28],p=[1,27],d=[1,29],v=[1,44],m=[1,35],g=[1,37],y=[1,38],b=[1,39],w=[1,40],E=[1,41],S=[1,42],x=[1,43],T=[16,38,39,40,41,42,43,45,46,47,48,49,50,51,52,53,55,62],N=[2,82],C=[1,53],k=[1,49],L=[5,9],A=[5,8,9,16,23,24,27,28,31,32,33,36,37,39,40,44,53,60,64,65,66,67,68,69,75],O=[1,62],M=[1,63],_=[1,64],D=[1,65],P=[1,66],H=[1,67],B=[1,68],j=[1,69],F=[1,70],I=[1,71],q=[1,72],R=[1,73],U=[1,74],z=[1,75],W=[1,76],X=[1,77],V=[1,78],$=[1,83],J=[1,85],K=[9,16,25,38,39,40,41,42,43,45,46,47,48,49,50,51,52,53,54,55,62,63,72],Q=[2,65],G=[1,91],Y=[2,89],Z=[5,8,9,16,23,24,25,26,27,28,31,32,33,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,60,62,63,64,65,66,67,68,69,72,75],et=[1,99],tt=[2,93],nt=[9,16,25,38,39,40,41,42,43,45,46,47,48,49,50,51,52,54,62,63,72],rt=[25,54],it=[9,16,25,38,39,40,45,46,47,48,49,50,51,52,54,62,63,72],st=[9,16,25,38,45,46,47,48,54,62,63,72],ot=[9,16,25,38,45,46,47,48,49,50,51,52,54,62,63,72],ut=[1,154],at={trace:function(){},yy:{},symbols_:{error:2,program:3,statements:4,EOF:5,statement_block:6,empty_block:7,"{":8,"}":9,non_empty_statements:10,statement:11,if_statement:12,while_statement:13,for_statement:14,break_statement:15,";":16,continue_statement:17,function_definition:18,return_statement:19,variable_definition:20,assignment_statement:21,expression:22,"if":23,"(":24,")":25,"else":26,"while":27,"for":28,for_initialiser:29,for_finaliser:30,"break":31,"continue":32,"function":33,identifier:34,identifiers:35,"return":36,"var":37,"=":38,"+":39,"-":40,"*":41,"/":42,"%":43,"!":44,"&&":45,"||":46,"===":47,"!==":48,">":49,"<":50,">=":51,"<=":52,"[":53,"]":54,".":55,constants:56,expressions:57,array_literal:58,object_literal:59,"new":60,function_expression:61,"?":62,":":63,STRING:64,FLOAT_NUMBER:65,INT_NUMBER:66,"true":67,"false":68,empty_list:69,non_empty_object_literal_statements:70,object_literal_statement:71,",":72,non_empty_expressions:73,non_empty_identifiers:74,Identifier:75,$accept:0,$end:1},terminals_:{2:"error",5:"EOF",8:"{",9:"}",16:";",23:"if",24:"(",25:")",26:"else",27:"while",28:"for",31:"break",32:"continue",33:"function",36:"return",37:"var",38:"=",39:"+",40:"-",41:"*",42:"/",43:"%",44:"!",45:"&&",46:"||",47:"===",48:"!==",49:">",50:"<",51:">=",52:"<=",53:"[",54:"]",55:".",60:"new",62:"?",63:":",64:"STRING",65:"FLOAT_NUMBER",66:"INT_NUMBER",67:"true",68:"false",69:"empty_list",72:",",75:"Identifier"},productions_:[0,[3,2],[3,2],[3,2],[7,2],[6,3],[4,0],[4,1],[10,2],[10,1],[11,1],[11,1],[11,1],[11,2],[11,2],[11,1],[11,2],[11,2],[11,2],[11,2],[11,1],[12,7],[12,7],[12,7],[12,7],[12,7],[12,7],[13,5],[13,5],[14,9],[14,9],[29,1],[29,1],[29,1],[29,0],[30,1],[30,1],[30,0],[15,1],[17,1],[18,6],[18,6],[19,2],[20,4],[21,3],[22,3],[22,3],[22,3],[22,3],[22,3],[22,2],[22,2],[22,2],[22,3],[22,3],[22,3],[22,3],[22,3],[22,3],[22,3],[22,3],[22,4],[22,3],[22,3],[22,1],[22,1],[22,6],[22,1],[22,1],[22,4],[22,6],[22,5],[22,1],[22,5],[56,1],[56,1],[56,1],[56,1],[56,1],[56,1],[58,3],[59,3],[59,1],[70,3],[70,1],[71,3],[61,5],[61,5],[57,1],[57,0],[73,3],[73,1],[35,1],[35,0],[74,3],[74,1],[34,1]],performAction:function(t,n,r,i,s,o,u){var a=o.length-1;switch(s){case 1:case 2:case 3:return o[a-1];case 4:this.$=[];break;case 5:case 63:this.$=o[a-1];break;case 6:case 89:case 93:this.$=[];break;case 8:o[a-1]===ft.no_op()?this.$=o[a]:this.$=ft.pair(o[a-1],o[a]);break;case 9:o[a]===ft.no_op()?this.$=[]:this.$=ft.pair(o[a],[]);break;case 20:this.$=ft.no_op();break;case 21:case 22:case 23:case 24:this.$=ft.if_statement(o[a-4],o[a-2],o[a],r);break;case 25:case 26:this.$=ft.if_statement(o[a-4],o[a-2],ft.pair(o[a],[]),r);break;case 27:case 28:this.$=ft.while_statement(o[a-2],o[a],r);break;case 29:case 30:this.$=ft.for_statement(o[a-6],o[a-4],o[a-2],o[a],r);break;case 38:this.$=ft.break_statement(r);break;case 39:this.$=ft.continue_statement(r);break;case 40:case 41:this.$=ft.variable_definition(o[a-4],ft.function_definition(o[a-4],o[a-2],o[a],u[a-5],u[a]),r);break;case 42:this.$=ft.return_statement(o[a],r);break;case 43:this.$=ft.variable_definition(o[a-2],o[a],r);break;case 44:o[a-2].tag==="variable"?this.$=ft.assignment(o[a-2],o[a],r):o[a-2].tag==="property_access"?this.$=ft.property_assignment(o[a-2].object,o[a-2].property,o[a],r):error("parse error in line "+r+": "+t);break;case 45:case 46:case 47:case 48:case 49:case 55:case 56:case 57:case 58:case 59:case 60:this.$=ft.eager_binary_expression(o[a-2],o[a-1],o[a],r);break;case 50:case 51:this.$=ft.eager_binary_expression(0,o[a-1],o[a],r);break;case 52:this.$=ft.eager_unary_expression(o[a-1],o[a],r);break;case 53:case 54:this.$=ft.boolean_operation(o[a-2],o[a-1],o[a],r);break;case 61:this.$=ft.property_access(o[a-3],o[a-1],r);break;case 62:this.$=ft.property_access(o[a-2],o[a],r);break;case 65:this.$=ft.variable(o[a],r);break;case 66:this.$=ft.application(o[a-4],o[a-1],r);break;case 69:this.$=ft.application(ft.variable(o[a-3],r),o[a-1],r);break;case 70:this.$=ft.object_method_application(o[a-5],o[a-3],o[a-1],r);break;case 71:this.$=ft.construction(o[a-3],o[a-1],r);break;case 73:this.$=ft.ternary(o[a-4],o[a-2],o[a],r);break;case 74:case 96:this.$=t;break;case 75:this.$=parseFloat(t);break;case 76:this.$=parseInt(t,10);break;case 77:this.$=!0;break;case 78:this.$=!1;break;case 79:this.$=ft.empty_list(r);break;case 80:this.$=ft.array_literal(o[a-1],r);break;case 81:this.$=ft.object_literal(o[a-1],r);break;case 82:this.$=ft.object_literal([],r);break;case 83:case 85:case 90:case 94:this.$=ft.pair(o[a-2],o[a]);break;case 84:case 91:case 95:this.$=ft.pair(o[a],[]);break;case 86:case 87:this.$=ft.function_definition("lambda",o[a-2],o[a],u[a-4],u[a]);break;case 88:case 92:this.$=o[a]}},table:[{3:1,4:2,5:[2,6],6:3,7:4,8:[1,6],10:5,11:7,12:8,13:9,14:10,15:11,16:n,17:12,18:13,19:14,20:15,21:16,22:17,23:r,24:i,27:s,28:o,31:u,32:a,33:f,34:32,36:l,37:c,39:h,40:p,44:d,53:v,56:31,58:33,59:34,60:m,61:36,64:g,65:y,66:b,67:w,68:E,69:S,75:x},{1:[3]},{5:[1,45]},{5:[1,46]},t(T,N,{5:[1,47]}),{5:[2,7]},{7:54,8:C,9:k,10:48,11:7,12:8,13:9,14:10,15:11,16:n,17:12,18:13,19:14,20:15,21:16,22:17,23:r,24:i,27:s,28:o,31:u,32:a,33:f,34:52,36:l,37:c,39:h,40:p,44:d,53:v,56:31,58:33,59:34,60:m,61:36,64:g,65:y,66:b,67:w,68:E,69:S,70:50,71:51,75:x},t(L,[2,9],{11:7,12:8,13:9,14:10,15:11,17:12,18:13,19:14,20:15,21:16,22:17,56:31,34:32,58:33,59:34,61:36,7:54,10:55,8:C,16:n,23:r,24:i,27:s,28:o,31:u,32:a,33:f,36:l,37:c,39:h,40:p,44:d,53:v,60:m,64:g,65:y,66:b,67:w,68:E,69:S,75:x}),t(A,[2,10]),t(A,[2,11]),t(A,[2,12]),{16:[1,56]},{16:[1,57]},t(A,[2,15]),{16:[1,58]},{16:[1,59]},{16:[1,60]},{16:[1,61],38:O,39:M,40:_,41:D,42:P,43:H,45:B,46:j,47:F,48:I,49:q,50:R,51:U,52:z,53:W,55:X,62:V},t(A,[2,20]),{24:[1,79]},{24:[1,80]},{24:[1,81]},{16:[2,38]},{16:[2,39]},{24:$,34:82,75:x},{7:54,8:C,22:84,24:i,33:J,34:32,39:h,40:p,44:d,53:v,56:31,58:33,59:34,60:m,61:36,64:g,65:y,66:b,67:w,68:E,69:S,75:x},{34:86,75:x},{7:54,8:C,22:87,24:i,33:J,34:32,39:h,40:p,44:d,53:v,56:31,58:33,59:34,60:m,61:36,64:g,65:y,66:b,67:w,68:E,69:S,75:x},{7:54,8:C,22:88,24:i,33:J,34:32,39:h,40:p,44:d,53:v,56:31,58:33,59:34,60:m,61:36,64:g,65:y,66:b,67:w,68:E,69:S,75:x},{7:54,8:C,22:89,24:i,33:J,34:32,39:h,40:p,44:d,53:v,56:31,58:33,59:34,60:m,61:36,64:g,65:y,66:b,67:w,68:E,69:S,75:x},{7:54,8:C,22:90,24:i,33:J,34:32,39:h,40:p,44:d,53:v,56:31,58:33,59:34,60:m,61:36,64:g,65:y,66:b,67:w,68:E,69:S,75:x},t(K,[2,64]),t(K,Q,{24:G}),t(K,[2,67]),t(K,[2,68]),{34:92,75:x},t(K,[2,72]),t(K,[2,74]),t(K,[2,75]),t(K,[2,76]),t(K,[2,77]),t(K,[2,78]),t(K,[2,79]),t([9,16,24,25,38,39,40,41,42,43,45,46,47,48,49,50,51,52,53,54,55,62,63,72],[2,96]),{7:54,8:C,22:95,24:i,33:J,34:32,39:h,40:p,44:d,53:v,54:Y,56:31,57:93,58:33,59:34,60:m,61:36,64:g,65:y,66:b,67:w,68:E,69:S,73:94,75:x},{1:[2,1]},{1:[2,2]},{1:[2,3]},{9:[1,96]},t(Z,[2,4]),{9:[1,97]},{9:[2,84],72:[1,98]},t(T,Q,{24:G,63:et}),{9:k,34:100,70:50,71:51,75:x},t(K,N),t(L,[2,8]),t(A,[2,13]),t(A,[2,14]),t(A,[2,16]),t(A,[2,17]),t(A,[2,18]),t(A,[2,19]),{7:54,8:C,22:101,24:i,33:J,34:32,39:h,40:p,44:d,53:v,56:31,58:33,59:34,60:m,61:36,64:g,65:y,66:b,67:w,68:E,69:S,75:x},{7:54,8:C,22:102,24:i,33:J,34:32,39:h,40:p,44:d,53:v,56:31,58:33,59:34,60:m,61:36,64:g,65:y,66:b,67:w,68:E,69:S,75:x},{7:54,8:C,22:103,24:i,33:J,34:32,39:h,40:p,44:d,53:v,56:31,58:33,59:34,60:m,61:36,64:g,65:y,66:b,67:w,68:E,69:S,75:x},{7:54,8:C,22:104,24:i,33:J,34:32,39:h,40:p,44:d,53:v,56:31,58:33,59:34,60:m,61:36,64:g,65:y,66:b,67:w,68:E,69:S,75:x},{7:54,8:C,22:105,24:i,33:J,34:32,39:h,40:p,44:d,53:v,56:31,58:33,59:34,60:m,61:36,64:g,65:y,66:b,67:w,68:E,69:S,75:x},{7:54,8:C,22:106,24:i,33:J,34:32,39:h,40:p,44:d,53:v,56:31,58:33,59:34,60:m,61:36,64:g,65:y,66:b,67:w,68:E,69:S,75:x},{7:54,8:C,22:107,24:i,33:J,34:32,39:h,40:p,44:d,53:v,56:31,58:33,59:34,60:m,61:36,64:g,65:y,66:b,67:w,68:E,69:S,75:x},{7:54,8:C,22:108,24:i,33:J,34:32,39:h,40:p,44:d,53:v,56:31,58:33,59:34,60:m,61:36,64:g,65:y,66:b,67:w,68:E,69:S,75:x},{7:54,8:C,22:109,24:i,33:J,34:32,39:h,40:p,44:d,53:v,56:31,58:33,59:34,60:m,61:36,64:g,65:y,66:b,67:w,68:E,69:S,75:x},{7:54,8:C,22:110,24:i,33:J,34:32,39:h,40:p,44:d,53:v,56:31,58:33,59:34,60:m,61:36,64:g,65:y,66:b,67:w,68:E,69:S,75:x},{7:54,8:C,22:111,24:i,33:J,34:32,39:h,40:p,44:d,53:v,56:31,58:33,59:34,60:m,61:36,64:g,65:y,66:b,67:w,68:E,69:S,75:x},{7:54,8:C,22:112,24:i,33:J,34:32,39:h,40:p,44:d,53:v,56:31,58:33,59:34,60:m,61:36,64:g,65:y,66:b,67:w,68:E,69:S,75:x},{7:54,8:C,22:113,24:i,33:J,34:32,39:h,40:p,44:d,53:v,56:31,58:33,59:34,60:m,61:36,64:g,65:y,66:b,67:w,68:E,69:S,75:x},{7:54,8:C,22:114,24:i,33:J,34:32,39:h,40:p,44:d,53:v,56:31,58:33,59:34,60:m,61:36,64:g,65:y,66:b,67:w,68:E,69:S,75:x},{7:54,8:C,22:115,24:i,33:J,34:32,39:h,40:p,44:d,53:v,56:31,58:33,59:34,60:m,61:36,64:g,65:y,66:b,67:w,68:E,69:S,75:x},{34:116,75:x},{7:54,8:C,22:117,24:i,33:J,34:32,39:h,40:p,44:d,53:v,56:31,58:33,59:34,60:m,61:36,64:g,65:y,66:b,67:w,68:E,69:S,75:x},{7:54,8:C,22:118,24:i,33:J,34:32,39:h,40:p,44:d,53:v,56:31,58:33,59:34,60:m,61:36,64:g,65:y,66:b,67:w,68:E,69:S,75:x},{7:54,8:C,22:119,24:i,33:J,34:32,39:h,40:p,44:d,53:v,56:31,58:33,59:34,60:m,61:36,64:g,65:y,66:b,67:w,68:E,69:S,75:x},{7:54,8:C,16:[2,34],20:122,21:123,22:121,24:i,29:120,33:J,34:32,37:c,39:h,40:p,44:d,53:v,56:31,58:33,59:34,60:m,61:36,64:g,65:y,66:b,67:w,68:E,69:S,75:x},{24:[1,124]},{25:tt,34:127,35:125,74:126,75:x},{16:[2,42],39:M,40:_,41:D,42:P,43:H,45:B,46:j,47:F,48:I,49:q,50:R,51:U,52:z,53:W,55:X,62:V},{24:$},{38:[1,128]},t(nt,[2,50],{53:W,55:X}),t(nt,[2,51],{53:W,55:X}),t(nt,[2,52],{53:W,55:X}),{25:[1,129],39:M,40:_,41:D,42:P,43:H,45:B,46:j,47:F,48:I,49:q,50:R,51:U,52:z,53:W,55:X,62:V},{7:54,8:C,22:95,24:i,25:Y,33:J,34:32,39:h,40:p,44:d,53:v,56:31,57:130,58:33,59:34,60:m,61:36,64:g,65:y,66:b,67:w,68:E,69:S,73:94,75:x},{24:[1,131]},{54:[1,132]},t(rt,[2,88]),t(rt,[2,91],{39:M,40:_,41:D,42:P,43:H,45:B,46:j,47:F,48:I,49:q,50:R,51:U,52:z,53:W,55:X,62:V,72:[1,133]}),t(Z,[2,5]),t(K,[2,81]),{34:100,70:134,71:51,75:x},{7:54,8:C,22:135,24:i,33:J,34:32,39:h,40:p,44:d,53:v,56:31,58:33,59:34,60:m,61:36,64:g,65:y,66:b,67:w,68:E,69:S,75:x},{63:et},t([16,25],[2,44],{39:M,40:_,41:D,42:P,43:H,45:B,46:j,47:F,48:I,49:q,50:R,51:U,52:z,53:W,55:X,62:V}),t(it,[2,45],{41:D,42:P,43:H,53:W,55:X}),t(it,[2,46],{41:D,42:P,43:H,53:W,55:X}),t(nt,[2,47],{53:W,55:X}),t(nt,[2,48],{53:W,55:X}),t(nt,[2,49],{53:W,55:X}),t([9,16,25,38,45,46,54,62,63,72],[2,53],{39:M,40:_,41:D,42:P,43:H,47:F,48:I,49:q,50:R,51:U,52:z,53:W,55:X}),t([9,16,25,38,46,54,62,63,72],[2,54],{39:M,40:_,41:D,42:P,43:H,45:B,47:F,48:I,49:q,50:R,51:U,52:z,53:W,55:X}),t(st,[2,55],{39:M,40:_,41:D,42:P,43:H,49:q,50:R,51:U,52:z,53:W,55:X}),t(st,[2,56],{39:M,40:_,41:D,42:P,43:H,49:q,50:R,51:U,52:z,53:W,55:X}),t(ot,[2,57],{39:M,40:_,41:D,42:P,43:H,53:W,55:X}),t(ot,[2,58],{39:M,40:_,41:D,42:P,43:H,53:W,55:X}),t(ot,[2,59],{39:M,40:_,41:D,42:P,43:H,53:W,55:X}),t(ot,[2,60],{39:M,40:_,41:D,42:P,43:H,53:W,55:X}),{39:M,40:_,41:D,42:P,43:H,45:B,46:j,47:F,48:I,49:q,50:R,51:U,52:z,53:W,54:[1,136],55:X,62:V},t(K,[2,62],{24:[1,137]}),{39:M,40:_,41:D,42:P,43:H,45:B,46:j,47:F,48:I,49:q,50:R,51:U,52:z,53:W,55:X,62:V,63:[1,138]},{25:[1,139],39:M,40:_,41:D,42:P,43:H,45:B,46:j,47:F,48:I,49:q,50:R,51:U,52:z,53:W,55:X,62:V},{25:[1,140],39:M,40:_,41:D,42:P,43:H,45:B,46:j,47:F,48:I,49:q,50:R,51:U,52:z,53:W,55:X,62:V},{16:[1,141]},{16:[2,31],38:O,39:M,40:_,41:D,42:P,43:H,45:B,46:j,47:F,48:I,49:q,50:R,51:U,52:z,53:W,55:X,62:V},{16:[2,32]},{16:[2,33]},{25:tt,34:127,35:142,74:126,75:x},{25:[1,143]},{25:[2,92]},{25:[2,95],72:[1,144]},{7:54,8:C,22:145,24:i,33:J,34:32,39:h,40:p,44:d,53:v,56:31,58:33,59:34,60:m,61:36,64:g,65:y,66:b,67:w,68:E,69:S,75:x},t(K,[2,63],{24:[1,146]}),{25:[1,147]},{7:54,8:C,22:95,24:i,25:Y,33:J,34:32,39:h,40:p,44:d,53:v,56:31,57:148,58:33,59:34,60:m,61:36,64:g,65:y,66:b,67:w,68:E,69:S,73:94,75:x},t(K,[2,80]),{7:54,8:C,22:95,24:i,33:J,34:32,39:h,40:p,44:d,53:v,56:31,58:33,59:34,60:m,61:36,64:g,65:y,66:b,67:w,68:E,69:S,73:149,75:x},{9:[2,83]},t([9,72],[2,85],{39:M,40:_,41:D,42:P,43:H,45:B,46:j,47:F,48:I,49:q,50:R,51:U,52:z,53:W,55:X,62:V}),t(K,[2,61]),{7:54,8:C,22:95,24:i,25:Y,33:J,34:32,39:h,40:p,44:d,53:v,56:31,57:150,58:33,59:34,60:m,61:36,64:g,65:y,66:b,67:w,68:E,69:S,73:94,75:x},{7:54,8:C,22:151,24:i,33:J,34:32,39:h,40:p,44:d,53:v,56:31,58:33,59:34,60:m,61:36,64:g,65:y,66:b,67:w,68:E,69:S,75:x},{6:152,7:153,8:ut},{6:155,7:156,8:ut},{7:54,8:C,22:157,24:i,33:J,34:32,39:h,40:p,44:d,53:v,56:31,58:33,59:34,60:m,61:36,64:g,65:y,66:b,67:w,68:E,69:S,75:x},{25:[1,158]},{6:159,7:160,8:ut},{34:127,74:161,75:x},{16:[2,43],39:M,40:_,41:D,42:P,43:H,45:B,46:j,47:F,48:I,49:q,50:R,51:U,52:z,53:W,55:X,62:V},{7:54,8:C,22:95,24:i,25:Y,33:J,34:32,39:h,40:p,44:d,53:v,56:31,57:162,58:33,59:34,60:m,61:36,64:g,65:y,66:b,67:w,68:E,69:S,73:94,75:x},t(K,[2,69]),{25:[1,163]},t(rt,[2,90]),{25:[1,164]},t([9,16,25,38,54,63,72],[2,73],{39:M,40:_,41:D,42:P,43:H,45:B,46:j,47:F,48:I,49:q,50:R,51:U,52:z,53:W,55:X,62:V}),{26:[1,165]},{26:[1,166]},{7:54,8:C,9:k,10:48,11:7,12:8,13:9,14:10,15:11,16:n,17:12,18:13,19:14,20:15,21:16,22:17,23:r,24:i,27:s,28:o,31:u,32:a,33:f,34:32,36:l,37:c,39:h,40:p,44:d,53:v,56:31,58:33,59:34,60:m,61:36,64:g,65:y,66:b,67:w,68:E,69:S,75:x},t(A,[2,27]),t(A,[2,28]),{16:[1,167],39:M,40:_,41:D,42:P,43:H,45:B,46:j,47:F,48:I,49:q,50:R,51:U,52:z,53:W,55:X,62:V},{6:168,7:169,8:ut},t(K,[2,86]),t(K,[2,87]),{25:[2,94]},{25:[1,170]},t(K,[2,71]),t(K,[2,70]),{6:171,7:172,8:ut,12:173,23:r},{6:174,7:175,8:ut,12:176,23:r},{7:54,8:C,21:178,22:179,24:i,25:[2,37],30:177,33:J,34:32,39:h,40:p,44:d,53:v,56:31,58:33,59:34,60:m,61:36,64:g,65:y,66:b,67:w,68:E,69:S,75:x},t(A,[2,40]),t(A,[2,41]),t(K,[2,66]),t(A,[2,21]),t(A,[2,22]),t(A,[2,25]),t(A,[2,23]),t(A,[2,24]),t(A,[2,26]),{25:[1,180]},{25:[2,35]},{25:[2,36],38:O,39:M,40:_,41:D,42:P,43:H,45:B,46:j,47:F,48:I,49:q,50:R,51:U,52:z,53:W,55:X,62:V},{6:181,7:182,8:ut},t(A,[2,29]),t(A,[2,30])],defaultActions:{5:[2,7],22:[2,38],23:[2,39],45:[2,1],46:[2,2],47:[2,3],122:[2,32],123:[2,33],126:[2,92],134:[2,83],161:[2,94],178:[2,35]},parseError:function(t,n){if(!n.recoverable){function r(e,t){this.message=e,this.hash=t}throw r.prototype=new Error,new r(t,n)}this.trace(t)},parse:function(t){function w(e){r.length=r.length-2*e,s.length=s.length-e,o.length=o.length-e}var n=this,r=[0],i=[],s=[null],o=[],u=this.table,a="",f=0,l=0,c=0,h=2,p=1,d=o.slice.call(arguments,1),v=Object.create(this.lexer),m={yy:{}};for(var g in this.yy)Object.prototype.hasOwnProperty.call(this.yy,g)&&(m.yy[g]=this.yy[g]);v.setInput(t,m.yy),m.yy.lexer=v,m.yy.parser=this,typeof v.yylloc=="undefined"&&(v.yylloc={});var y=v.yylloc;o.push(y);var b=v.options&&v.options.ranges;typeof m.yy.parseError=="function"?this.parseError=m.yy.parseError:this.parseError=Object.getPrototypeOf(this).parseError;function E(){var e;return e=v.lex()||p,typeof e!="number"&&(e=n.symbols_[e]||e),e}var S,x,T,N,C,k,L={},A,O,M,_;for(;;){T=r[r.length-1];if(this.defaultActions[T])N=this.defaultActions[T];else{if(S===null||typeof S=="undefined")S=E();N=u[T]&&u[T][S]}if(typeof N=="undefined"||!N.length||!N[0]){var D="";_=[];for(A in u[T])this.terminals_[A]&&A>h&&_.push("'"+this.terminals_[A]+"'");v.showPosition?D="Parse error on line "+(f+1)+":\n"+v.showPosition()+"\nExpecting "+_.join(", ")+", got '"+(this.terminals_[S]||S)+"'":D="Parse error on line "+(f+1)+": Unexpected "+(S==p?"end of input":"'"+(this.terminals_[S]||S)+"'"),this.parseError(D,{text:v.match,token:this.terminals_[S]||S,line:v.yylineno,loc:y,expected:_})}if(N[0]instanceof Array&&N.length>1)throw new Error("Parse Error: multiple actions possible at state: "+T+", token: "+S);switch(N[0]){case 1:r.push(S),s.push(v.yytext),o.push(v.yylloc),r.push(N[1]),S=null,x?(S=x,x=null):(l=v.yyleng,a=v.yytext,f=v.yylineno,y=v.yylloc,c>0&&c--);break;case 2:O=this.productions_[N[1]][1],L.$=s[s.length-O],L._$={first_line:o[o.length-(O||1)].first_line,last_line:o[o.length-1].last_line,first_column:o[o.length-(O||1)].first_column,last_column:o[o.length-1].last_column},b&&(L._$.range=[o[o.length-(O||1)].range[0],o[o.length-1].range[1]]),k=this.performAction.apply(L,[a,l,f,m.yy,N[1],s,o].concat(d));if(typeof k!="undefined")return k;O&&(r=r.slice(0,-1*O*2),s=s.slice(0,-1*O),o=o.slice(0,-1*O)),r.push(this.productions_[N[1]][0]),s.push(L.$),o.push(L._$),M=u[r[r.length-2]][r[r.length-1]],r.push(M);break;case 3:return!0}}return!0}},ft=e("lib/parser/nodes"),lt=function(){var e={EOF:1,parseError:function(t,n){if(!this.yy.parser)throw new Error(t);this.yy.parser.parseError(t,n)},setInput:function(e,t){return this.yy=t||this.yy||{},this._input=e,this._more=this._backtrack=this.done=!1,this.yylineno=this.yyleng=0,this.yytext=this.matched=this.match="",this.conditionStack=["INITIAL"],this.yylloc={first_line:1,first_column:0,last_line:1,last_column:0},this.options.ranges&&(this.yylloc.range=[0,0]),this.offset=0,this},input:function(){var e=this._input[0];this.yytext+=e,this.yyleng++,this.offset++,this.match+=e,this.matched+=e;var t=e.match(/(?:\r\n?|\n).*/g);return t?(this.yylineno++,this.yylloc.last_line++):this.yylloc.last_column++,this.options.ranges&&this.yylloc.range[1]++,this._input=this._input.slice(1),e},unput:function(e){var t=e.length,n=e.split(/(?:\r\n?|\n)/g);this._input=e+this._input,this.yytext=this.yytext.substr(0,this.yytext.length-t),this.offset-=t;var r=this.match.split(/(?:\r\n?|\n)/g);this.match=this.match.substr(0,this.match.length-1),this.matched=this.matched.substr(0,this.matched.length-1),n.length-1&&(this.yylineno-=n.length-1);var i=this.yylloc.range;return this.yylloc={first_line:this.yylloc.first_line,last_line:this.yylineno+1,first_column:this.yylloc.first_column,last_column:n?(n.length===r.length?this.yylloc.first_column:0)+r[r.length-n.length].length-n[0].length:this.yylloc.first_column-t},this.options.ranges&&(this.yylloc.range=[i[0],i[0]+this.yyleng-t]),this.yyleng=this.yytext.length,this},more:function(){return this._more=!0,this},reject:function(){return this.options.backtrack_lexer?(this._backtrack=!0,this):this.parseError("Lexical error on line "+(this.yylineno+1)+". You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).\n"+this.showPosition(),{text:"",token:null,line:this.yylineno})},less:function(e){this.unput(this.match.slice(e))},pastInput:function(){var e=this.matched.substr(0,this.matched.length-this.match.length);return(e.length>20?"...":"")+e.substr(-20).replace(/\n/g,"")},upcomingInput:function(){var e=this.match;return e.length<20&&(e+=this._input.substr(0,20-e.length)),(e.substr(0,20)+(e.length>20?"...":"")).replace(/\n/g,"")},showPosition:function(){var e=this.pastInput(),t=(new Array(e.length+1)).join("-");return e+this.upcomingInput()+"\n"+t+"^"},test_match:function(e,t){var n,r,i;this.options.backtrack_lexer&&(i={yylineno:this.yylineno,yylloc:{first_line:this.yylloc.first_line,last_line:this.last_line,first_column:this.yylloc.first_column,last_column:this.yylloc.last_column},yytext:this.yytext,match:this.match,matches:this.matches,matched:this.matched,yyleng:this.yyleng,offset:this.offset,_more:this._more,_input:this._input,yy:this.yy,conditionStack:this.conditionStack.slice(0),done:this.done},this.options.ranges&&(i.yylloc.range=this.yylloc.range.slice(0))),r=e[0].match(/(?:\r\n?|\n).*/g),r&&(this.yylineno+=r.length),this.yylloc={first_line:this.yylloc.last_line,last_line:this.yylineno+1,first_column:this.yylloc.last_column,last_column:r?r[r.length-1].length-r[r.length-1].match(/\r?\n?/)[0].length:this.yylloc.last_column+e[0].length},this.yytext+=e[0],this.match+=e[0],this.matches=e,this.yyleng=this.yytext.length,this.options.ranges&&(this.yylloc.range=[this.offset,this.offset+=this.yyleng]),this._more=!1,this._backtrack=!1,this._input=this._input.slice(e[0].length),this.matched+=e[0],n=this.performAction.call(this,this.yy,this,t,this.conditionStack[this.conditionStack.length-1]),this.done&&this._input&&(this.done=!1);if(n)return n;if(this._backtrack){for(var s in i)this[s]=i[s];return!1}return!1},next:function(){if(this.done)return this.EOF;this._input||(this.done=!0);var e,t,n,r;this._more||(this.yytext="",this.match="");var i=this._currentRules();for(var s=0;s<i.length;s++){n=this._input.match(this.rules[i[s]]);if(n&&(!t||n[0].length>t[0].length)){t=n,r=s;if(this.options.backtrack_lexer){e=this.test_match(n,i[s]);if(e!==!1)return e;if(this._backtrack){t=!1;continue}return!1}if(!this.options.flex)break}}return t?(e=this.test_match(t,i[r]),e!==!1?e:!1):this._input===""?this.EOF:this.parseError("Lexical error on line "+(this.yylineno+1)+". Unrecognized text.\n"+this.showPosition(),{text:"",token:null,line:this.yylineno})},lex:function(){var t=this.next();return t?t:this.lex()},begin:function(t){this.conditionStack.push(t)},popState:function(){var t=this.conditionStack.length-1;return t>0?this.conditionStack.pop():this.conditionStack[0]},_currentRules:function(){return this.conditionStack.length&&this.conditionStack[this.conditionStack.length-1]?this.conditions[this.conditionStack[this.conditionStack.length-1]].rules:this.conditions.INITIAL.rules},topState:function(t){return t=this.conditionStack.length-1-Math.abs(t||0),t>=0?this.conditionStack[t]:"INITIAL"},pushState:function(t){this.begin(t)},stateStackSize:function(){return this.conditionStack.length},options:{},performAction:function(t,n,r,i){var s=i;switch(r){case 0:break;case 1:break;case 2:break;case 3:return 33;case 4:return"INVALID";case 5:return 36;case 6:return 23;case 7:return 26;case 8:return 27;case 9:return 28;case 10:return"case";case 11:return"default";case 12:return 60;case 13:return 31;case 14:return 32;case 15:return 37;case 16:return 47;case 17:return 38;case 18:return 8;case 19:return 9;case 20:return 16;case 21:return 72;case 22:return 67;case 23:return 68;case 24:return 69;case 25:return 53;case 26:return 54;case 27:return 55;case 28:this.begin("DoubleQuotedString"),this.string="";break;case 29:this.begin("SingleQuotedString"),this.string="";break;case 30:this.begin("QuotedStringEscape");break;case 31:return n.yytext=this.string,this.string=undefined,this.popState(),64;case 32:return n.yytext=this.string,this.string=undefined,this.popState(),64;case 33:switch(n.yytext){case"\r\n":case"\n":break;case"b":this.string+="\b";break;case"n":this.string+="\n";break;case"r":this.string+="\r";break;case"t":this.string+="	";break;case"'":this.string+="'";break;case'"':this.string+='"';break;case"\\":this.string+="\\";break;default:this.string+="\\"+$1}this.popState();break;case 34:this.string+=n.yytext;break;case 35:this.string+=n.yytext;break;case 36:return 75;case 37:return 65;case 38:return 66;case 39:return 39;case 40:return 40;case 41:return 41;case 42:return 42;case 43:return 43;case 44:return 48;case 45:return 52;case 46:return 51;case 47:return 50;case 48:return 49;case 49:return 44;case 50:return 45;case 51:return 46;case 52:return 24;case 53:return 25;case 54:return 62;case 55:return 63;case 56:return 5;case 57:return"INVALID"}},rules:[/^(?:\/\/([^\n\r]*))/,/^(?:\/\*([\u0000-\uffff]*?)\*\/)/,/^(?:\s+)/,/^(?:function\b)/,/^(?:return\s*\n)/,/^(?:return\b)/,/^(?:if\b)/,/^(?:else\b)/,/^(?:while\b)/,/^(?:for\b)/,/^(?:case\b)/,/^(?:default\b)/,/^(?:new\b)/,/^(?:break\b)/,/^(?:continue\b)/,/^(?:var\b)/,/^(?:===)/,/^(?:=)/,/^(?:\{)/,/^(?:\})/,/^(?:;)/,/^(?:,)/,/^(?:true\b)/,/^(?:false\b)/,/^(?:\[\])/,/^(?:\[)/,/^(?:\])/,/^(?:\.)/,/^(?:")/,/^(?:')/,/^(?:\\)/,/^(?:")/,/^(?:')/,/^(?:(.|\r\n|\n))/,/^(?:[^"\\]*)/,/^(?:[^'\\]*)/,/^(?:[A-Za-z_][A-Za-z0-9_]*)/,/^(?:[0-9]+(\.[0-9]+)?([eE][\-+]?[0-9]+)?\b)/,/^(?:[0-9]+\b)/,/^(?:\+)/,/^(?:-)/,/^(?:\*)/,/^(?:\/)/,/^(?:%)/,/^(?:!==)/,/^(?:<=)/,/^(?:>=)/,/^(?:<)/,/^(?:>)/,/^(?:!)/,/^(?:&&)/,/^(?:\|\|)/,/^(?:\()/,/^(?:\))/,/^(?:\?)/,/^(?::)/,/^(?:$)/,/^(?:.)/],conditions:{QuotedStringEscape:{rules:[33],inclusive:!1},SingleQuotedString:{rules:[30,32,35],inclusive:!1},DoubleQuotedString:{rules:[30,31,34],inclusive:!1},INITIAL:{rules:[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57],inclusive:!0}}};return e}();return at.lexer=lt,at.lexer.options.ranges=!0,at}),t("lib/main")});
define('misc',[],function() {
return {
    initialize: function(week, export_symbol) {
				if (typeof window !== 'undefined') {
		    	export_symbol('alert', alert);
				}
				if (week === 4) {
		        export_symbol('display', display, "(message)");
				}
				if (week >= 5) {
		        export_symbol('is_null', is_null, "(x)");
		        export_symbol('is_number', is_number, "(x)");
		        export_symbol('is_string', is_string, "(x)");
		        export_symbol('is_boolean', is_boolean, "(x)");
		        export_symbol('is_object', is_object, "(x)");
		        export_symbol('is_function', is_function, "(x)");
		        export_symbol('is_NaN', is_NaN, "(x)");
		        export_symbol('is_undefined', is_undefined, "(x)");
		        export_symbol('is_array', is_array, "(x)");
		        export_symbol('runtime', runtime);
		        export_symbol('error', error, "(message)");
		        export_symbol('newline', newline);
		        export_symbol('random', random);
		        export_symbol('timed', timed, "(f)");
		        export_symbol('read', read);
		        export_symbol('write', write);
			  }
				if (week >= 12) {
		        	export_symbol('has_own_property', has_own_property);
		        	export_symbol('apply_in_underlying_javascript',
						apply_in_underlying_javascript);
				}
    }
};
});

define('list',[],function() {
return {
initialize : function(week, export_symbol) {
    if (week >= 5) {
        export_symbol('array_test', array_test);
        export_symbol('pair', pair, "(x, y)");
        export_symbol('is_pair', is_pair, "(x)");
        export_symbol('head', head, "(xs)");
        export_symbol('tail', tail, "(xs)");
        export_symbol('is_empty_list', is_empty_list, "(xs)");
        export_symbol('is_list', is_list, "(x)");
        export_symbol('display', display);
        export_symbol('list', list);
        export_symbol('list_to_vector', list_to_vector, "(xs)");
        export_symbol('vector_to_list', vector_to_list, "(v)");
        export_symbol('length', length, "(xs)");
        export_symbol('map', map, "(f, xs)");
        export_symbol('build_list', build_list, "(n, f)");
        export_symbol('for_each', for_each, "(f, xs)");
        export_symbol('list_to_string', list_to_string, "(xs)");
        export_symbol('reverse', reverse, "(xs)");
        export_symbol('append', append, "(xs, ys)");
        export_symbol('member', member, "(v, xs)");
        export_symbol('remove', remove, "(v, xs)");
        export_symbol('remove_all', remove_all, "(v, xs)");
        export_symbol('equal', equal, "(x, y)");
        if (week >= 8) {
            export_symbol('assoc', assoc, "(v, xs)");
            export_symbol('set_head', set_head, "(xs, x)");
            export_symbol('set_tail', set_tail, "(xs, x)");
        }
        export_symbol('filter', filter, "(pred, xs)");
        export_symbol('enum_list', enum_list, "(start, end)");
        export_symbol('list_ref', list_ref, "(xs, n)");
        export_symbol('accumulate', accumulate, "(op, initial, xs)");
    }
}
}
});


define('object',[],function() {
return {
	initialize: function(week, export_symbol) {
	  if (week >= 10) {
	      export_symbol('is_instance_of', is_instance_of, "(a, b)");
	  }
	}
};
});

define('stream',[],function () {

return {
  initialize: function(week, export_symbol) {
      if (week >= 10) {
          export_symbol('stream_tail', stream_tail, "(xs)");
          export_symbol('is_stream', is_stream, "(xs)");
          export_symbol('list_to_stream', list_to_stream, "(xs)");
          export_symbol('stream_to_list', stream_to_list, "(xs)");
          export_symbol('stream', stream);
          export_symbol('stream_length', stream_length, "(xs)");
          export_symbol('stream_map', stream_map, "(f, xs)");
          export_symbol('build_stream', build_stream, "(n, f)");
          export_symbol('stream_for_each', stream_for_each, "(f, xs)");
          export_symbol('stream_reverse', stream_reverse, "(xs)");
          export_symbol('stream_to_vector', stream_to_vector, "(xs)");
          export_symbol('stream_append', stream_append, "(xs, ys)");
          export_symbol('stream_member', stream_member, "(v, xs)");
          export_symbol('stream_remove', stream_remove, "(v, xs)");
          export_symbol('stream_remove_all', stream_remove_all, "(v, xs)");
          export_symbol('stream_filter', stream_filter, "(pred, xs)");
          export_symbol('enum_stream', enum_stream, "(start, end)");
          export_symbol('integers_from', integers_from, "(n)");
          export_symbol('eval_stream', eval_stream, "(xs, n)");
          export_symbol('stream_ref', stream_ref, "(xs, n)");
      }
  }
};
});

define('interpreter',[],function() {
return {
	 initialize : function(week, export_symbol) {
		 if (week >= 10) {
     		parser_register_native_function('Object', Object);
	 	 }
		 if (week >= 12) {
			 export_symbol('parse', parse, "(source_text)");
			 export_symbol('apply_in_underlying_javascript',
				 apply_in_underlying_javascript);
			 export_symbol('parse_and_evaluate', parse_and_evaluate);
			 export_symbol('parser_register_native_function',
			 	parser_register_native_function);
			 export_symbol('parser_register_native_variable',
			 	parser_register_native_variable);
			 export_symbol('is_object', is_object);
			 export_symbol('JSON', JSON);
			 export_symbol('Function', Function);
			 export_symbol('RegExp', RegExp);
		 }
	 }
};

});


define('library-loader',['require','misc','list','object','stream','interpreter'],function(require) {
    var initialize = function(week, export_symbol) {
        export_symbol("Infinity", Infinity);
        export_symbol("NaN", NaN);
        export_symbol("undefined", undefined);
        export_symbol("Math", Math);
        if (week >= 6) {
            export_symbol("String", String);
        }
        var Misc = require('misc');
        Misc.initialize(week, export_symbol);

        if (week >= 5) {
          var List = require('list');
          export_symbol("parseInt", parseInt);
          export_symbol("prompt", prompt);
          List.initialize(week, export_symbol);
        }

    	if (week >= 9) {
          var Object_ = require('object');
          Object_.initialize(week, export_symbol);
        }

        if (week >= 10) {
            var Stream = require('stream');
            Stream.initialize(week, export_symbol);
        }

        if (week >= 12) {
            var Interpreter = require('interpreter');
            Interpreter.initialize(week, export_symbol);
        }
    };
    return { initialize: initialize };
});

/*
 * This main file is configured for CS1101S JFDI Academy.
 * It should be loaded on JFDI Academy after the bundled jedi-runtime file.
 */
define('main',['require','../dist/jedi-runtime','library-loader'],function(require) {
    var API = {}
    var vm;
    var vm_debug;
    var lines;
    var debug;
    var orig_offset;
    var symbols = [];
    var parser_week;
    var Parser;
    var JediRuntime = require("../dist/jedi-runtime");
    var Compiler = JediRuntime.Compiler;
    var Runtime  = JediRuntime.Runtime;
    var Debug = JediRuntime.Debug;

    API.version = JediRuntime.version;

    function get_current_context() {
        if (typeof window !== 'undefined') {
          return window;
        } else {
          return global;
        }
    }

    function handle_parser_error(exception) {
        throw exception.message;
    }

    function handle_compiler_error(exception, source) {
        lines = source.split(/\r?\n/);
        message = "\nOn line " + (e.line + 1) + "\n\n";
        message += lines[e.line] + "\n\n";
        message += e.message;
        throw message;
    }

    API.initialize = function(week, context) {
        // Handle Old API Call
        if (typeof week === 'object' ) {
          var temp = context;
          context = week;
          week = context;
        }
        var LibraryLoader = require('library-loader');
        context = context || get_current_context();
        week = week || 13;
        Parser = JediRuntime.Parser(week);
        context.export_symbol = function(name, fun, unused_2) {
            context[name] = fun;
            symbols.push(name);
        };
        // Required by interpreter library
        LibraryLoader.initialize(week, context.export_symbol);
    };

    API.parse = function(src) {
        var ast;
        try {
            ast = Parser.parse(src);
        } catch (e) {
            handle_parser_error(e);
        }
        return ast;
    };

    API.parse_and_compile = function(src) {
        return Compiler.compile(API.parse(src), src);
    };

    API.get_javascript = function(name) {
        return API.to_javascript(vm.environment.get(name));
    };

    API.parse_and_evaluate = function(src, reinitialize, context, timeout) {
        var instructions, ast, artifact, result, message, offset,
          root_environment;
        var now = +(new Date());
        var timeout_at = (timeout > 0) ? (now + timeout) : Infinity;
        context = context || get_current_context();
        reinitialize = reinitialize || false;
        ast = this.parse(src);

        try {
            artifact = Compiler.compile(ast, src);
        } catch (e) {
            handle_compiler_error(e);
        }

        try {
            instructions = artifact.instructions;
            if (reinitialize || vm === undefined) {
                debug = artifact.debug;
                vm = new Runtime(symbols, context);
                lines = src.split(/\r?\n/);
                orig_offset = instructions.length;
                offset = instructions.length;
                root_environment = vm.environment
                result = vm.execute_instruction(instructions,
                  undefined, undefined, timeout_at).value;
            } else {
                offset = vm.instruction_array.length;
                root_environment = vm.environment
                result = vm.execute_more_instruction(instructions,
                  timeout_at).value;
            }
            return result;
        } catch (e) {
            var message = "";
            if (vm.pc < orig_offset && debug[vm.pc] !== undefined
                  && debug[vm.pc].line !== undefined) {
              message = "\nOn line " + (debug[vm.pc].line + 1) + "\n\n";
              message += lines[debug[vm.pc].line] + "\n\n";
            } else if (artifact.debug[vm.pc - offset] !== undefined &&
                       artifact.debug[vm.pc - offset].line !== undefined) {
              lines = src.split(/\r?\n/);
              message = "\nOn line " +
                (artifact.debug[vm.pc - offset].line + 1) + "\n\n";
              message += lines[artifact.debug[vm.pc - offset].line] + "\n\n";
            }
            vm.environment = root_environment;
            if (e.message !== undefined) {
                throw message + e.message + (JSON.stringify(e.line) || "");
            } else {
                throw message + e;
            }
        }
    };

    API.debug = function(src, reinitialize, breakpointsArray, context) {
        var instructions, ast, artifact, result, message, offset,
          root_environment;
        context = context || get_current_context();
        reinitialize = reinitialize || false;

        try {
            ast = Parser.parse(src);
        } catch (e) {
            handle_parser_error(e);
        }

        try {
            artifact = Compiler.compile(ast, src);
        } catch (e) {
            handle_compiler_error(e);
        }

            debug = artifact.debug;
            instructions = artifact.instructions;

        try {
            if(reinitialize || vm_debug === undefined) {
                lines = src.split(/\r?\n/);
                orig_offset = instructions.length;
                vm_debug = new Debug(src, symbols, context);
            }
            vm_debug.setBreakpoints(breakpointsArray);

            offset = instructions.length;
            root_environment = vm_debug.runtime.environment
            var result = vm_debug.start();

            return {
                stack: vm_debug.getDebugInfo(),
                status: result.status,
                line_no: vm_debug.getCurrentLineNumber()
            };
        } catch (e) {
            var message = "";
            if (vm_debug.runtime.pc < orig_offset && debug[vm_debug.runtime.pc] !== undefined
                  && debug[vm_debug.runtime.pc].line !== undefined) {
              message = "\nOn line " + (debug[vm_debug.runtime.pc].line + 1) + "\n\n";
              message += lines[debug[vm_debug.runtime.pc].line] + "\n\n";
            } else if (artifact.debug[vm_debug.runtime.pc - offset] !== undefined &&
                       artifact.debug[vm_debug.runtime.pc - offset].line !== undefined) {
              lines = src.split(/\r?\n/);
              message = "\nOn line " +
                (artifact.debug[vm_debug.runtime.pc - offset].line + 1) + "\n\n";
              message += lines[artifact.debug[vm_debug.runtime.pc - offset].line] + "\n\n";
            }
            vm_debug.runtime.environment = root_environment;
            if (e.message !== undefined) {
                throw message + e.message + (JSON.stringify(e.line) || "");
            } else {
                throw message + e;
            }
        }
    };

    API.inject = function(id, js_value) {
        if (vm !== undefined) {
            vm.inject(id, js_value);
        }
    };

    API.stringify = function(result) {
        if (result === undefined) {
            return "undefined";
        } else {
            return vm.stringify_value(result);
        }
    };
    API.to_javascript = function(result) {
        if (result === undefined) {
            return undefined;
        } else {
            return vm.vm_value_to_javascript(result);
        }
    };
    return API;
});


return require('main');
}));
