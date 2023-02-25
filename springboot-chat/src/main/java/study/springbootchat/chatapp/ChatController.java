package study.springbootchat.chatapp;

import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.time.LocalDateTime;

@RequiredArgsConstructor
@RestController
public class ChatController {

    // Controller을 생성하여 Postman을 이용하여 데이터를 삽입하기 전까지는 몽고DB에 데이터베이스와 컬렉션은 생성되지 않는다.

    private final ChatRepository chatRepository;

    // MediaType.TEXT_EVENT_STREAM_VALUE을 통해 SSE 프로토콜을 사용한다.
    // Server-Sent Events (SSE) : HTTP 프로토콜에서 클라이언트가 서버로부터 데이터를 실시간으로 스트리밍 받을 수 있는 HTML5 표준 기술이다.
    // SSE에서는 서버 → 클라이언트 단방향으로만 데이터가 흐른다.
    // CrossOrigin : JS요청 허용
    @CrossOrigin
    @GetMapping(value="/sender/{sender}/receiver/{receiver}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<Chat> getMsg(@PathVariable String sender, @PathVariable String receiver){
        return chatRepository.mFindBySender(sender,receiver)
                .subscribeOn(Schedulers.boundedElastic());
    }

    @CrossOrigin
    @GetMapping(value = "/chat/roomNum/{roomNum}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<Chat> findByRoomNum(@PathVariable Integer roomNum){
        return chatRepository.mFindByRoomNum(roomNum)
                .subscribeOn(Schedulers.boundedElastic());
    }

    @CrossOrigin
    @PostMapping("/chat")
    public Mono<Chat> setMsg(@RequestBody Chat chat){
        chat.setCreatedAt(LocalDateTime.now());
        // Object를 리턴하면 자동으로 MessageConverter가 자동으로 JSON으로 변환
        return chatRepository.save(chat);
    }
}
