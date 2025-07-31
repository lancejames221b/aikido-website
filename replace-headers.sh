#!/bin/bash

# Replace header sections with shared navigation placeholder

for file in /Users/lj/Dev/Aikido/pages/*.html; do
    if [[ "$(basename "$file")" != "the-art-of-peace.html" ]]; then
        echo "Processing $file"
        
        # Use perl for multiline replacement to replace entire header section
        perl -i -0pe 's|<header class="header">.*?</header>|    <!-- Shared Navigation -->\n    <div id="shared-navigation"></div>|gs' "$file"
    fi
done

echo "Header replacement complete!"