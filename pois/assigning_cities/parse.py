import pandas as pd
from math import radians, cos, sin, asin, sqrt
from multiprocessing import Pool

chunk_size = 100
def split_dataframe(df): 
    chunks = list()
    num_chunks = len(df) // chunk_size + 1
    for i in range(num_chunks):
        chunks.append((df[i*chunk_size:(i+1)*chunk_size], i))
    return chunks

def haversine(lon1, lat1, lon2, lat2):
    """
    Calculate the great circle distance between two points 
    on the earth (specified in decimal degrees)
    """
    # convert decimal degrees to radians 
    lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
    # haversine formula 
    dlon = lon2 - lon1 
    dlat = lat2 - lat1 
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a)) 
    # Radius of earth in kilometers is 6371
    km = 6371* c
    return km

# Export from DB
cities = pd.read_csv('cities.csv', delimiter=";")
pois = pd.read_csv('pois.csv', delimiter=";")

# print(len(pois))

poi_len = len(pois)

# print(cities.head(10))

pois["nearest_city"] = pd.Series(dtype='string')

def nearest(poi):
    distances = []
    for index, city in cities.iterrows():
        distances.append(
            (
                haversine(poi['lng'], poi['lat'], city['lng'], city['lat']),
                city["id"]
            )
        )
    distances.sort(key=lambda x: x[0])
    return str(distances[0][1])

def handleChunk(chunk: tuple[pd.DataFrame, int]):
    for index, poi in chunk[0].iterrows():
        chunk[0].at[index, "nearest_city"] = nearest(poi)
    chunk[0].to_csv(f'./out/pois-{chunk[1]}.csv', sep='\t')
    print(f'{chunk[1]} / {poi_len // chunk_size + 1} done.')

if __name__ == '__main__':
    with Pool() as pool:
        result = pool.map(handleChunk, split_dataframe(pois))
    