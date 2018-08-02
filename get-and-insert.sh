#!/bin/bash

# Script to get values from borgerforslag.

# Error handling in this script is horrible. It is supposed to be run
# from cron, and then stuff to stderr will be mailed. I hope.

DB=borgerforslag
DBUSER=borgerforslag

# LOGFILE
LOGFILE=$HOME/borgerforslag.log

function die() {
    echo "ERROR:" "$@"
    echo "ERROR:" "$@" >> $LOGFILE
#    exit 1
}

# This function gets a specific named (id) proposal, and gets the current value.
# id: The name (e.g. FT-00124) of the proposal
# Note, error handling is non-existant currently
function get_and_count() {
    id=$1
    
    wget -q 'https://www.borgerforslag.dk/se-og-stoet-forslag/?Id='$id -O $id.html || { die "Unable to get content" ; return; }

    # This is horrible. Last one remove thousand seperator
    COUNT=$(grep "Antal støtter" $id.html | sed 's/<\/strong>/¤/g' | tr "¤" "\n"  | grep "Antal støtter" | sed 's/.*>//' | tr -d ".")
    echo $COUNT
}

# We get four different proposals for now.
for proposal in FT-00124 FT-00104 FT-00180 FT-00193 FT-00042 FT-00201 FT-00259 FT-00110 FT-00192 FT-00289 FT-00192 FT-00090 FT-00180 FT-00146 FT-00598 FT-00410 FT-00273 FT-00209; do
    count=$(get_and_count $proposal)
    test -t 1 && echo "For $proposal, got $count, inserting" 
    echo "For $proposal, got $count" >> $LOGFILE
    mysql -u $DBUSER $DB <<EOF
insert into data (name, count) values ('$proposal', $count)
EOF
done;
