#!/bin/bash

# Script to get values from borgerforslag.

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

# We get four different proposals
for proposal in FT-00124 FT-00120 FT-00131 FT-00005 ; do
    count=$(get_and_count $proposal)
    test -t 1 && echo "For $proposal, got $count" 
    echo "For $proposal, got $count" >> $LOGFILE
    mysql -u $DBUSER $DB <<EOF
insert into data (name, count) values ('$proposal', $count)
EOF
#    || die "Unable to insert data for $proposal, $count"
done;
