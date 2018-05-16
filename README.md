# binder
Generates and publishes documentation for PhET simulation components.

See [https://phetsims.github.io/binder/](https://phetsims.github.io/binder/) for public up to date documentation and style guide on PhET sim
components.

## generation
To generate the docs:
 
    cd js/; node generate.js;

To generate docs with only specific simulation examples, add them as an argument, comma separated:

    cd js/; node generate.js ohms-law,wave-on-a-string;
    
The generated docs load sim to gather runtime information. To bypass this step and use stored data from sim loads:

    cd js/; node createHTMLString.js json binderjson.json > html.html

NOTE: This will only log out the html string, not write it to the output file. The above snippet will copy the output
into a file of your choosing.


For more information see https://github.com/phetsims/binder/ or contact @mbarlow12.