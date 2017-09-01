package com.test.project.sample;

import java.util.Collection;
import java.util.HashSet;
import java.util.Set;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

@Path("/books")
public class BookResource {

    private Set<Book> books = new HashSet<Book>();

    public BookResource() {
        for (int i = 0; i < 10; i++) {
            books.add(new Book(i, "Title " + i, "Author " + i));
        }
    }

    @GET
    public Collection<Book> list() {
        return books;
    }

    @GET
    @Path("test")
    @Produces(MediaType.TEXT_PLAIN)
    public String test() {
        return "Test";
    }

}
