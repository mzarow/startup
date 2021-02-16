export interface FromDtoToDomain<Dto, Domain> {
  fromDtoToDomain(dto: Dto): Domain;
}

export interface FromDomainToDto<Domain, Dto> {
  fromDomainToDto(domain: Domain): Dto;
}

export interface Mapper<Dto, Domain> extends FromDtoToDomain<Dto, Domain>, FromDomainToDto<Domain, Dto> {}
