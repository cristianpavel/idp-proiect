Proiect IDP

Etapa 2: Pentru etapa 2 am clientul, serviciul de login si baza de date.
Momentan sistemul nu este in totalitate functional pentru ca lipsesc
celelalte componente. Dar cele 3 sisteme comunica intre ele si sunt
functionale. Pentru a testa se va rula:
	docker stack deploy --compose-file docker-compose.yml [nume]

Dupa aceasta se poate intra din browser la adresa localhost:8000.
Sistemul de login accepta comenzi, numai ca momentan nu exista
niciun user inregistrat.
