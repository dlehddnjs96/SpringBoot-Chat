package study.springbootchat.chatapp;

import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import org.springframework.data.mongodb.repository.Tailable;
import reactor.core.publisher.Flux;

public interface ChatRepository extends ReactiveMongoRepository<Chat, String> {



    // Tailable : 데이터를 하나 보낸 후에 닫는게 아니라 계속 커서를 유지해서 데이터가 들어오면 받게 한다. (Tailalbe : 뒤따를 수 있는)
    // Tailable 어노테이션을 사용하면 큰 사이즈의 버퍼가 필요하므로 몽고DB에서 버퍼 사이즈를 설정해줘야 한다. (프롬프트에서 설정)
    // db.runCommand({convertToCapped: 'chat', size: 8192}); (해당 DB를 사용한 상태에서 컬렉션의 사이즈를 설정)
    @Tailable
    @Query("{sender:?0,receiver:?1}")
    // Flux : 데이터를 한번 받고 끝내는게 아니라, 계속해서 받겠다는 것으로 Response를 유지하면서 데이터를 계속 흘려보낼 수 있다. (Flux : 흐름)
    Flux<Chat> mFindBySender(String sender, String receiver);

    @Tailable
    @Query("{roomNum:?0}")
    Flux<Chat> mFindByRoomNum(Integer roomNum);
}
