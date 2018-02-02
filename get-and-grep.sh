#!/bin/bash

# LOGFILE
LOGFILE=$HOME/stoetter-log.txt

function die() {
    echo "ERROR:" "$@"
#    exit 1
}

function get_and_grep() {
    id=$1
    
    wget 'https://www.borgerforslag.dk/se-og-stoet-forslag/?Id='$id -O $id.html || { die "Unable to get content" ; return; }

    # This is horrible
    COUNT=$(grep "Antal støtter" $id.html | sed 's/<\/strong>/¤/g' | tr "¤" "\n"  | grep "Antal støtter" | sed 's/.*>//')
    echo $COUNT
}

# While forever
while true ; do
    
    # Get the content
    DATE=$(date +"%d-%m-%Y%t%H:%M:%S%t")
    ID=$(get_and_grep FT-00124)
    HJ=$(get_and_grep FT-00120)
    GM=$(get_and_grep FT-00131)
    UL=$(get_and_grep FT-00005)

    LINE="$DATE$ID\t$HJ\t$GM\t$UL"
    
    echo -e "$LINE"
    echo -e "$LINE" >> $LOGFILE
    
    sleep 298
done
