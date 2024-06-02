RUN node create_db.js

RUN cd worldcities
RUN node read_worldcities_csv.js
RUN node read_image_urls.js

RUN cd ..

RUN cd unesco
RUN node get_unesco_list.js

RUN cd ..

RUN cd segment_allCountries
RUN node segmentAllCountries.js
RUN node read_pois.js